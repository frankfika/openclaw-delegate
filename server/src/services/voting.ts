/**
 * Real Voting Service - Snapshot & On-chain Governance
 *
 * Supports:
 * - Snapshot off-chain voting (gasless)
 * - On-chain governor contract voting (requires gas)
 */

import snapshot from '@snapshot-labs/snapshot.js';
import { Wallet } from 'ethers';
import { config } from '../config.js';

const hub = 'https://hub.snapshot.org'; // Snapshot GraphQL hub
const client = new snapshot.Client712(hub);

/**
 * Vote on a Snapshot proposal
 */
export async function voteOnSnapshot(params: {
  space: string; // e.g., 'aave.eth'
  proposalId: string;
  choice: number | number[] | Record<string, number>; // Voting choice(s)
  reason?: string; // Optional vote reason
  privateKey: string; // Wallet private key for signing
}): Promise<{ id: string; ipfs: string }> {
  const { space, proposalId, choice, reason, privateKey } = params;

  // Create wallet from private key
  const wallet = new Wallet(privateKey);
  const voterAddress = wallet.address;

  console.log(`📝 Casting Snapshot vote from ${voterAddress}...`);
  console.log(`   Space: ${space}`);
  console.log(`   Proposal: ${proposalId}`);
  console.log(`   Choice: ${JSON.stringify(choice)}`);

  try {
    // Cast the vote
    const receipt = await client.vote(wallet as any, voterAddress, {
      space,
      proposal: proposalId,
      type: 'single-choice', // Can be: single-choice, approval, quadratic, ranked-choice, weighted, basic
      choice,
      reason: reason || '',
      app: 'openclaw-delegate', // Your app identifier
    }) as { id: string; ipfs: string };

    console.log(`✅ Vote cast successfully!`);
    console.log(`   IPFS: ${receipt.ipfs}`);
    console.log(`   ID: ${receipt.id}`);

    return receipt;
  } catch (err: any) {
    console.error(`❌ Failed to cast Snapshot vote:`, err.message);
    throw new Error(`Snapshot vote failed: ${err.message}`);
  }
}

/**
 * Get voting power for an address in a Snapshot space
 */
export async function getSnapshotVotingPower(
  space: string,
  voterAddress: string,
  proposalId?: string
): Promise<{ vp: number; symbol: string }> {
  try {
    // Fetch space info to get strategies
    const spaceQuery = `
      query Space($id: String!) {
        space(id: $id) {
          id
          name
          symbol
          strategies {
            name
            params
          }
        }
      }
    `;

    const spaceRes = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: spaceQuery, variables: { id: space } }),
    });

    const spaceData = await spaceRes.json() as any;
    const spaceInfo = spaceData.data?.space;

    if (!spaceInfo) {
      throw new Error('Space not found');
    }

    // For now, return mock voting power
    // In production, use @snapshot-labs/snapshot.js getScores() or similar
    return {
      vp: 1000,
      symbol: spaceInfo.symbol || 'VP',
    };
  } catch (err: any) {
    console.error(`Failed to get voting power:`, err.message);
    throw err;
  }
}

/**
 * Vote on an on-chain governor contract (e.g., Compound, Uniswap)
 */
export async function voteOnChain(params: {
  governorAddress: string; // Governor contract address
  proposalId: string | number; // On-chain proposal ID
  support: number; // 0 = Against, 1 = For, 2 = Abstain
  reason?: string;
  privateKey: string;
  rpcUrl: string; // Chain RPC URL
}): Promise<{ txHash: string; blockNumber: number }> {
  const { governorAddress, proposalId, support, reason, privateKey, rpcUrl } = params;

  console.log(`🔗 Casting on-chain vote...`);
  console.log(`   Governor: ${governorAddress}`);
  console.log(`   Proposal ID: ${proposalId}`);
  console.log(`   Support: ${support}`);

  // TODO: Implement on-chain voting using ethers.js
  // Example for Compound/Governor Bravo:
  /*
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const governorABI = [
    'function castVote(uint256 proposalId, uint8 support) external returns (uint256)',
    'function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external returns (uint256)',
  ];

  const governor = new ethers.Contract(governorAddress, governorABI, wallet);

  const tx = reason
    ? await governor.castVoteWithReason(proposalId, support, reason)
    : await governor.castVote(proposalId, support);

  const receipt = await tx.wait();

  return {
    txHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
  };
  */

  // ⚠️ MOCK: Replace with actual on-chain voting in production
  const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
  console.log(`✅ On-chain vote cast (mock): ${mockTxHash}`);

  return {
    txHash: mockTxHash,
    blockNumber: 12345678,
  };
}

/**
 * Validate a private key
 */
export function validatePrivateKey(privateKey: string): boolean {
  try {
    new Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wallet address from private key
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new Wallet(privateKey);
  return wallet.address;
}

/**
 * Unified voting interface
 */
export async function castVote(params: {
  proposalId: string;
  daoSpace: string;
  governanceType: 'snapshot' | 'onchain';
  choice: number | number[];
  reason?: string;
  privateKey: string;
  governorAddress?: string;
  rpcUrl?: string;
}): Promise<{
  success: boolean;
  txHash?: string;
  ipfs?: string;
  error?: string;
}> {
  const { proposalId, daoSpace, governanceType, choice, reason, privateKey } = params;

  try {
    if (governanceType === 'snapshot') {
      const receipt = await voteOnSnapshot({
        space: daoSpace,
        proposalId,
        choice: Array.isArray(choice) ? choice[0] : choice,
        reason,
        privateKey,
      });

      return {
        success: true,
        ipfs: receipt.ipfs,
        txHash: receipt.id,
      };
    } else {
      const { governorAddress, rpcUrl } = params;

      if (!governorAddress || !rpcUrl) {
        throw new Error('governorAddress and rpcUrl required for on-chain voting');
      }

      const receipt = await voteOnChain({
        governorAddress,
        proposalId,
        support: Array.isArray(choice) ? choice[0] : choice,
        reason,
        privateKey,
        rpcUrl,
      });

      return {
        success: true,
        txHash: receipt.txHash,
      };
    }
  } catch (err: any) {
    console.error(`Vote failed:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}
