/**
 * Voting Service - Snapshot voting power queries
 *
 * Vote signing is now handled client-side via MetaMask EIP-712.
 * This service only provides voting power queries and wallet validation.
 */

const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';

/**
 * Get real voting power for an address via Snapshot GraphQL vp query
 */
export async function getSnapshotVotingPower(
  space: string,
  voterAddress: string,
  proposalId?: string
): Promise<{ vp: number; symbol: string }> {
  try {
    // If we have a proposalId, use the vp query for accurate results
    if (proposalId) {
      const vpQuery = `
        query VotingPower($voter: String!, $space: String!, $proposal: String!) {
          vp(voter: $voter, space: $space, proposal: $proposal) {
            vp
            vp_by_strategy
            vp_state
          }
        }
      `;

      const vpRes = await fetch(SNAPSHOT_GRAPHQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: vpQuery,
          variables: { voter: voterAddress, space, proposal: proposalId },
        }),
      });

      const vpData = await vpRes.json() as any;
      const vp = vpData.data?.vp;

      if (vp) {
        // Also get the space symbol
        const spaceInfo = await getSpaceInfo(space);
        return {
          vp: vp.vp ?? 0,
          symbol: spaceInfo?.symbol || 'VP',
        };
      }
    }

    // Fallback: just get space info
    const spaceInfo = await getSpaceInfo(space);
    if (!spaceInfo) {
      throw new Error('Space not found');
    }

    return {
      vp: 0,
      symbol: spaceInfo.symbol || 'VP',
    };
  } catch (err: any) {
    console.error(`Failed to get voting power:`, err.message);
    throw err;
  }
}

async function getSpaceInfo(space: string) {
  const spaceQuery = `
    query Space($id: String!) {
      space(id: $id) {
        id
        name
        symbol
      }
    }
  `;

  const spaceRes = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: spaceQuery, variables: { id: space } }),
  });

  const spaceData = await spaceRes.json() as any;
  return spaceData.data?.space || null;
}

/**
 * Validate an Ethereum address format
 */
export function validateAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
