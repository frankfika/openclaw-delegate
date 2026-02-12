import {
  API_CONFIG,
  DAO_CONFIGS,
  getDAOBySpaceId,
  getPointsForDAO,
  getDAOTier,
  getTrackedSpaceIds,
} from '../../../shared/config.js';

// Re-export utility functions for backward compatibility
export { getPointsForDAO, getDAOTier };

// Get tracked spaces from shared config
const TRACKED_SPACES = getTrackedSpaceIds();

export interface SnapshotProposal {
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

/**
 * Build GraphQL query for proposals
 */
function buildProposalsQuery(spaces: string[], state?: string): string {
  const whereConditions = [`space_in: ${JSON.stringify(spaces)}`];
  if (state) {
    whereConditions.push(`state: "${state}"`);
  }

  return `
    query Proposals {
      proposals(
        first: ${API_CONFIG.DEFAULT_PAGE_SIZE}
        skip: 0
        where: { ${whereConditions.join(', ')} }
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
}

/**
 * Fetch active proposals from Snapshot
 */
export async function fetchActiveProposals(daoFilter?: string): Promise<SnapshotProposal[]> {
  const spaces = daoFilter
    ? TRACKED_SPACES.filter(s => s.toLowerCase().includes(daoFilter.toLowerCase()))
    : TRACKED_SPACES;

  if (spaces.length === 0 && daoFilter) {
    spaces.push(daoFilter);
  }

  const query = buildProposalsQuery(spaces, 'active');

  try {
    const res = await fetch(API_CONFIG.SNAPSHOT_GRAPHQL_URL, {
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
  } catch (err: any) {
    console.error('Failed to fetch active proposals:', err.message);
    throw err;
  }
}

/**
 * Fetch a single proposal by ID
 */
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

  try {
    const res = await fetch(API_CONFIG.SNAPSHOT_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } }),
    });

    if (!res.ok) {
      throw new Error(`Snapshot API error: ${res.status}`);
    }

    const json = await res.json() as any;
    return json.data?.proposal || null;
  } catch (err: any) {
    console.error(`Failed to fetch proposal ${id}:`, err.message);
    throw err;
  }
}

/**
 * Fetch recent proposals (all states)
 */
export async function fetchRecentProposals(limit?: number): Promise<SnapshotProposal[]> {
  const query = `
    query RecentProposals {
      proposals(
        first: ${limit || API_CONFIG.DEFAULT_PAGE_SIZE}
        skip: 0
        where: { space_in: ${JSON.stringify(TRACKED_SPACES)} }
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

  try {
    const res = await fetch(API_CONFIG.SNAPSHOT_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`Snapshot API error: ${res.status}`);
    }

    const json = await res.json() as any;
    return json.data?.proposals || [];
  } catch (err: any) {
    console.error('Failed to fetch recent proposals:', err.message);
    throw err;
  }
}

/**
 * Fetch closed proposals for a specific DAO
 */
export async function fetchClosedProposals(spaceId: string, limit = 10): Promise<SnapshotProposal[]> {
  const query = `
    query ClosedProposals {
      proposals(
        first: ${limit}
        skip: 0
        where: { space: "${spaceId}", state: "closed" }
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

  try {
    const res = await fetch(API_CONFIG.SNAPSHOT_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`Snapshot API error: ${res.status}`);
    }

    const json = await res.json() as any;
    return json.data?.proposals || [];
  } catch (err: any) {
    console.error(`Failed to fetch closed proposals for ${spaceId}:`, err.message);
    return [];
  }
}

// Get all tracked DAO spaces
export function getTrackedSpaces(): string[] {
  return [...TRACKED_SPACES];
}

// Re-export DAO configs for backward compatibility
export { DAO_CONFIGS };
