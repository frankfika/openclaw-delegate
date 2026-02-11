const SNAPSHOT_GRAPHQL_URL = 'https://hub.snapshot.org/graphql';

// Multi-chain DAO tracking configuration
// Each DAO earns users different points based on their importance and activity
const TRACKED_SPACES = [
  // Tier 1 - Major DeFi Protocols (High points: 100 per vote)
  'aave.eth',
  'uniswapgovernance.eth',
  'curve-dao.eth',
  'compoundgrants.eth',

  // Tier 2 - L2 & Infrastructure (Medium-High points: 80 per vote)
  'arbitrumfoundation.eth',
  'optimismgov.eth',
  'stgdao.eth', // Stargate
  'polygonfoundation.eth',

  // Tier 3 - DeFi & Liquidity (Medium points: 60 per vote)
  'lido-snapshot.eth',
  'balancer.eth',
  'sushigov.eth',
  'hop.eth',
  '1inch.eth',

  // Tier 4 - Infrastructure & Tools (Medium points: 60 per vote)
  'ens.eth',
  'safe.eth',
  'gitcoindao.eth',
  'thegraph.eth',

  // Tier 5 - Emerging & Community (Lower points: 40 per vote)
  'paraswap-dao.eth',
  'olympusdao.eth',
  'apecoin.eth',
];

// Point rewards per vote by DAO space
export const DAO_POINT_REWARDS: Record<string, number> = {
  // Tier 1
  'aave.eth': 100,
  'uniswapgovernance.eth': 100,
  'curve-dao.eth': 100,
  'compoundgrants.eth': 100,

  // Tier 2
  'arbitrumfoundation.eth': 80,
  'optimismgov.eth': 80,
  'stgdao.eth': 80,
  'polygonfoundation.eth': 80,

  // Tier 3
  'lido-snapshot.eth': 60,
  'balancer.eth': 60,
  'sushigov.eth': 60,
  'hop.eth': 60,
  '1inch.eth': 60,

  // Tier 4
  'ens.eth': 60,
  'safe.eth': 60,
  'gitcoindao.eth': 60,
  'thegraph.eth': 60,

  // Tier 5
  'paraswap-dao.eth': 40,
  'olympusdao.eth': 40,
  'apecoin.eth': 40,
};

interface SnapshotProposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: string;
  scores: number[];
  scores_total: number;
  votes: number;
  type: string;
  network: string;
  space: {
    id: string;
    name: string;
  };
}

export async function fetchActiveProposals(daoFilter?: string): Promise<SnapshotProposal[]> {
  const spaces = daoFilter
    ? TRACKED_SPACES.filter(s => s.toLowerCase().includes(daoFilter.toLowerCase()))
    : TRACKED_SPACES;

  if (spaces.length === 0 && daoFilter) {
    // Try the exact space ID
    spaces.push(daoFilter);
  }

  const query = `
    query Proposals {
      proposals(
        first: 20
        skip: 0
        where: {
          space_in: ${JSON.stringify(spaces)}
          state: "active"
        }
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_total
        votes
        type
        network
        space {
          id
          name
        }
      }
    }
  `;

  const res = await fetch(SNAPSHOT_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Snapshot API error: ${res.status}`);
  }

  const json = await res.json() as any;

  if (json.errors) {
    throw new Error(`Snapshot GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data?.proposals || [];
}

export async function fetchProposalById(id: string): Promise<SnapshotProposal | null> {
  const query = `
    query Proposal($id: String!) {
      proposal(id: $id) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_total
        votes
        type
        network
        space {
          id
          name
        }
      }
    }
  `;

  const res = await fetch(SNAPSHOT_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
  });

  if (!res.ok) {
    throw new Error(`Snapshot API error: ${res.status}`);
  }

  const json = await res.json() as any;
  return json.data?.proposal || null;
}

// Fetch recent closed proposals for activity history
export async function fetchRecentProposals(): Promise<SnapshotProposal[]> {
  const query = `
    query RecentProposals {
      proposals(
        first: 10
        skip: 0
        where: {
          space_in: ${JSON.stringify(TRACKED_SPACES)}
        }
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_total
        votes
        type
        network
        space {
          id
          name
        }
      }
    }
  `;

  const res = await fetch(SNAPSHOT_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`Snapshot API error: ${res.status}`);
  const json = await res.json() as any;
  return json.data?.proposals || [];
}

// Helper function to get point reward for a DAO space
export function getPointsForDAO(spaceId: string): number {
  return DAO_POINT_REWARDS[spaceId] || 20; // Default 20 points for unlisted DAOs
}

// Get all tracked DAO spaces
export function getTrackedSpaces(): string[] {
  return [...TRACKED_SPACES];
}

// Tier 4 spaces (Infrastructure & Tools) - same points as tier 3 but different category
const TIER_4_SPACES = ['ens.eth', 'safe.eth', 'gitcoindao.eth', 'thegraph.eth'];

// Get DAO tier information
export function getDAOTier(spaceId: string): { tier: number; points: number; name: string } {
  const points = getPointsForDAO(spaceId);
  let tier = 5;
  let tierName = 'Emerging';

  if (points >= 100) {
    tier = 1;
    tierName = 'Major DeFi';
  } else if (points >= 80) {
    tier = 2;
    tierName = 'L2 & Infrastructure';
  } else if (points >= 60) {
    if (TIER_4_SPACES.includes(spaceId)) {
      tier = 4;
      tierName = 'Infrastructure & Tools';
    } else {
      tier = 3;
      tierName = 'Established DeFi';
    }
  } else if (points >= 40) {
    tier = 5;
    tierName = 'Community';
  }

  return { tier, points, name: tierName };
}
