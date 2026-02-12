/**
 * Browser-side Snapshot SDK service
 *
 * Handles real EIP-712 signed voting via MetaMask,
 * voting power queries, and existing vote detection.
 */

import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';

/**
 * Cast a real Snapshot vote via MetaMask EIP-712 signature.
 * This triggers a MetaMask popup for the user to sign.
 */
export async function castSnapshotVote(params: {
  space: string;
  proposal: string;
  type: string;
  choice: number | number[] | Record<string, number>;
  reason?: string;
  account: string;
}): Promise<{ id: string; ipfs: string }> {
  const { space, proposal, type, choice, reason, account } = params;

  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }

  const provider = new Web3Provider(window.ethereum as any);

  const receipt = await client.vote(provider as any, account, {
    space,
    proposal,
    type: type || 'single-choice',
    choice,
    reason: reason || '',
    app: 'votenow',
  });

  return receipt as { id: string; ipfs: string };
}

/**
 * Query real voting power from Snapshot GraphQL.
 */
export async function getVotingPower(params: {
  address: string;
  space: string;
  proposal: string;
}): Promise<{ vp: number; vp_by_strategy: number[]; vp_state: string }> {
  const { address, space, proposal } = params;

  const query = `
    query VotingPower($voter: String!, $space: String!, $proposal: String!) {
      vp(voter: $voter, space: $space, proposal: $proposal) {
        vp
        vp_by_strategy
        vp_state
      }
    }
  `;

  const res = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { voter: address, space, proposal },
    }),
  });

  const json = await res.json();
  const vp = json.data?.vp;

  if (!vp) {
    return { vp: 0, vp_by_strategy: [], vp_state: 'invalid' };
  }

  return {
    vp: vp.vp ?? 0,
    vp_by_strategy: vp.vp_by_strategy ?? [],
    vp_state: vp.vp_state ?? 'unknown',
  };
}

/**
 * Check if a voter has already voted on a proposal.
 */
export async function getExistingVote(params: {
  proposal: string;
  voter: string;
}): Promise<{ id: string; choice: number; created: number; vp: number } | null> {
  const { proposal, voter } = params;

  const query = `
    query Votes($proposal: String!, $voter: String!) {
      votes(
        where: { proposal: $proposal, voter: $voter }
        first: 1
      ) {
        id
        choice
        created
        vp
      }
    }
  `;

  const res = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { proposal, voter },
    }),
  });

  const json = await res.json();
  const votes = json.data?.votes;

  if (!votes || votes.length === 0) {
    return null;
  }

  return votes[0];
}
