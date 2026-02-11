/**
 * DAO Manager - Multi-chain DAO data support and management
 *
 * Core responsibilities:
 * - Track multiple DAOs across different chains
 * - Manage DAO metadata and configuration
 * - Store and query proposals from all DAOs
 * - Track voting history across all DAOs
 * - Provide unified analytics and statistics
 */

import { fetchActiveProposals, fetchProposalById } from './snapshot.js';
import { getPointsForDAO, getDAOTier } from './snapshot.js';

// DAO configuration and metadata
export interface DAOConfig {
  id: string; // Unique identifier (e.g., 'aave.eth')
  name: string; // Display name
  chain: string; // Blockchain (ethereum, arbitrum, optimism, etc.)
  governanceType: 'snapshot' | 'onchain' | 'both';
  snapshotSpace?: string; // Snapshot space ID
  governorAddress?: string; // On-chain governor contract
  tokenAddress?: string; // Governance token address
  tier: number; // 1-5 based on importance
  pointsPerVote: number; // Base points awarded
  isActive: boolean;
  metadata: {
    website?: string;
    description?: string;
    logo?: string;
    socials?: {
      twitter?: string;
      discord?: string;
      forum?: string;
    };
  };
  addedAt: string;
}

// Unified proposal data structure (supports both Snapshot and on-chain)
export interface UnifiedProposal {
  id: string;
  daoId: string;
  daoName: string;
  title: string;
  description: string;
  proposer: string;
  state: 'active' | 'closed' | 'executed' | 'defeated' | 'queued';
  governanceType: 'snapshot' | 'onchain';

  // Voting details
  choices: string[];
  startTime: number;
  endTime: number;
  snapshot: string; // Block number or timestamp

  // Results
  scores: number[];
  scoresTotal: number;
  voteCount: number;
  quorum?: number;
  quorumReached?: boolean;

  // Chain info
  network: string;

  // Tracking
  createdAt: string;
  updatedAt: string;
}

// Vote record across all DAOs
export interface VoteRecord {
  id: string;
  proposalId: string;
  daoId: string;
  voterAddress: string;
  choice: number | number[]; // Single choice or multiple
  votingPower: string;
  reason?: string;
  txHash?: string;
  pointsEarned: number;
  timestamp: string;
}

// DAO statistics
export interface DAOStats {
  daoId: string;
  totalProposals: number;
  activeProposals: number;
  totalVotes: number;
  uniqueVoters: number;
  averageParticipation: number;
  totalPointsDistributed: number;
  lastActivity: string;
}

// In-memory storage (replace with database in production)
const daoConfigs = new Map<string, DAOConfig>();
const proposals = new Map<string, UnifiedProposal>();
const voteRecords: VoteRecord[] = [];
const daoStats = new Map<string, DAOStats>();

/**
 * Initialize with default DAO configurations
 */
export function initializeDAOs() {
  const defaultDAOs: Omit<DAOConfig, 'addedAt'>[] = [
    // Tier 1 - Major DeFi
    {
      id: 'aave.eth',
      name: 'Aave',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'aave.eth',
      governorAddress: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
      tokenAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
      metadata: {
        website: 'https://aave.com',
        description: 'Leading DeFi lending protocol',
        logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
        socials: {
          twitter: 'https://twitter.com/aave',
          discord: 'https://discord.gg/aave',
          forum: 'https://governance.aave.com',
        },
      },
    },
    {
      id: 'uniswapgovernance.eth',
      name: 'Uniswap',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'uniswapgovernance.eth',
      governorAddress: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
      tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
      metadata: {
        website: 'https://uniswap.org',
        description: 'Leading decentralized exchange protocol',
        logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
        socials: {
          twitter: 'https://twitter.com/Uniswap',
          discord: 'https://discord.gg/uniswap',
          forum: 'https://gov.uniswap.org',
        },
      },
    },
    {
      id: 'curve-dao.eth',
      name: 'Curve DAO',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'curve-dao.eth',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
      metadata: {
        website: 'https://curve.fi',
        description: 'DEX optimized for stablecoin trading',
      },
    },
    {
      id: 'compoundgrants.eth',
      name: 'Compound',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'compoundgrants.eth',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
      metadata: {
        website: 'https://compound.finance',
        description: 'Autonomous interest rate protocol',
      },
    },

    // Tier 2 - L2 & Infrastructure
    {
      id: 'arbitrumfoundation.eth',
      name: 'Arbitrum DAO',
      chain: 'arbitrum',
      governanceType: 'both',
      snapshotSpace: 'arbitrumfoundation.eth',
      tier: 2,
      pointsPerVote: 80,
      isActive: true,
      metadata: {
        website: 'https://arbitrum.io',
        description: 'Leading Ethereum L2 scaling solution',
        socials: {
          twitter: 'https://twitter.com/arbitrum',
          forum: 'https://forum.arbitrum.foundation',
        },
      },
    },
    {
      id: 'optimismgov.eth',
      name: 'Optimism',
      chain: 'optimism',
      governanceType: 'both',
      snapshotSpace: 'optimismgov.eth',
      tier: 2,
      pointsPerVote: 80,
      isActive: true,
      metadata: {
        website: 'https://optimism.io',
        description: 'Ethereum L2 scaling with retroactive public goods funding',
      },
    },
    {
      id: 'stgdao.eth',
      name: 'Stargate',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'stgdao.eth',
      tier: 2,
      pointsPerVote: 80,
      isActive: true,
      metadata: {
        website: 'https://stargate.finance',
        description: 'Omnichain liquidity transport protocol',
      },
    },
    {
      id: 'polygonfoundation.eth',
      name: 'Polygon',
      chain: 'polygon',
      governanceType: 'snapshot',
      snapshotSpace: 'polygonfoundation.eth',
      tier: 2,
      pointsPerVote: 80,
      isActive: true,
      metadata: {
        website: 'https://polygon.technology',
        description: 'Ethereum scaling and infrastructure platform',
      },
    },

    // Tier 3 - Established DeFi
    {
      id: 'lido-snapshot.eth',
      name: 'Lido',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'lido-snapshot.eth',
      tier: 3,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://lido.fi',
        description: 'Leading liquid staking protocol',
      },
    },
    {
      id: 'balancer.eth',
      name: 'Balancer',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'balancer.eth',
      tier: 3,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://balancer.fi',
        description: 'Automated portfolio manager and liquidity provider',
      },
    },
    {
      id: 'sushigov.eth',
      name: 'SushiSwap',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'sushigov.eth',
      tier: 3,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://sushi.com',
        description: 'Community-driven DEX and DeFi platform',
      },
    },
    {
      id: 'hop.eth',
      name: 'Hop Protocol',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'hop.eth',
      tier: 3,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://hop.exchange',
        description: 'Cross-chain bridge for tokens',
      },
    },
    {
      id: '1inch.eth',
      name: '1inch',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: '1inch.eth',
      tier: 3,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://1inch.io',
        description: 'DEX aggregator',
      },
    },

    // Tier 4 - Infrastructure & Tools
    {
      id: 'ens.eth',
      name: 'ENS',
      chain: 'ethereum',
      governanceType: 'both',
      snapshotSpace: 'ens.eth',
      tier: 4,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://ens.domains',
        description: 'Ethereum Name Service',
      },
    },
    {
      id: 'safe.eth',
      name: 'Safe',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'safe.eth',
      tier: 4,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://safe.global',
        description: 'Smart contract wallet infrastructure',
      },
    },
    {
      id: 'gitcoindao.eth',
      name: 'Gitcoin',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'gitcoindao.eth',
      tier: 4,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://gitcoin.co',
        description: 'Public goods funding platform',
      },
    },
    {
      id: 'thegraph.eth',
      name: 'The Graph',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'thegraph.eth',
      tier: 4,
      pointsPerVote: 60,
      isActive: true,
      metadata: {
        website: 'https://thegraph.com',
        description: 'Decentralized indexing protocol',
      },
    },

    // Tier 5 - Community
    {
      id: 'paraswap-dao.eth',
      name: 'ParaSwap',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'paraswap-dao.eth',
      tier: 5,
      pointsPerVote: 40,
      isActive: true,
      metadata: {
        website: 'https://paraswap.io',
        description: 'DEX aggregator',
      },
    },
    {
      id: 'olympusdao.eth',
      name: 'Olympus DAO',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'olympusdao.eth',
      tier: 5,
      pointsPerVote: 40,
      isActive: true,
      metadata: {
        website: 'https://olympusdao.finance',
        description: 'Decentralized reserve currency protocol',
      },
    },
    {
      id: 'apecoin.eth',
      name: 'ApeCoin DAO',
      chain: 'ethereum',
      governanceType: 'snapshot',
      snapshotSpace: 'apecoin.eth',
      tier: 5,
      pointsPerVote: 40,
      isActive: true,
      metadata: {
        website: 'https://apecoin.com',
        description: 'Community token for Bored Ape ecosystem',
      },
    },
  ];

  // Add all DAOs
  for (const dao of defaultDAOs) {
    addDAO({
      ...dao,
      addedAt: new Date().toISOString(),
    });
  }

  console.log(`✅ Initialized ${defaultDAOs.length} DAOs`);
}

/**
 * Add a new DAO to track
 */
export function addDAO(config: DAOConfig): void {
  daoConfigs.set(config.id, config);

  // Initialize stats
  if (!daoStats.has(config.id)) {
    daoStats.set(config.id, {
      daoId: config.id,
      totalProposals: 0,
      activeProposals: 0,
      totalVotes: 0,
      uniqueVoters: 0,
      averageParticipation: 0,
      totalPointsDistributed: 0,
      lastActivity: new Date().toISOString(),
    });
  }
}

/**
 * Get all DAOs
 */
export function getAllDAOs(): DAOConfig[] {
  return Array.from(daoConfigs.values());
}

/**
 * Get active DAOs only
 */
export function getActiveDAOs(): DAOConfig[] {
  return Array.from(daoConfigs.values()).filter(dao => dao.isActive);
}

/**
 * Get DAO by ID
 */
export function getDAOById(daoId: string): DAOConfig | undefined {
  return daoConfigs.get(daoId);
}

/**
 * Get DAOs by chain
 */
export function getDAOsByChain(chain: string): DAOConfig[] {
  return Array.from(daoConfigs.values()).filter(dao => dao.chain === chain);
}

/**
 * Get DAOs by tier
 */
export function getDAOsByTier(tier: number): DAOConfig[] {
  return Array.from(daoConfigs.values()).filter(dao => dao.tier === tier);
}

/**
 * Update DAO configuration
 */
export function updateDAO(daoId: string, updates: Partial<DAOConfig>): DAOConfig | null {
  const dao = daoConfigs.get(daoId);
  if (!dao) return null;

  const updated = { ...dao, ...updates };
  daoConfigs.set(daoId, updated);
  return updated;
}

/**
 * Store or update a proposal
 */
export function storeProposal(proposal: UnifiedProposal): void {
  proposals.set(proposal.id, proposal);

  // Update DAO stats
  const stats = daoStats.get(proposal.daoId);
  if (stats) {
    stats.totalProposals = Array.from(proposals.values())
      .filter(p => p.daoId === proposal.daoId).length;
    stats.activeProposals = Array.from(proposals.values())
      .filter(p => p.daoId === proposal.daoId && p.state === 'active').length;
    stats.lastActivity = new Date().toISOString();
  }
}

/**
 * Get all proposals (with optional filters)
 */
export function getProposals(filters?: {
  daoId?: string;
  state?: string;
  limit?: number;
}): UnifiedProposal[] {
  let result = Array.from(proposals.values());

  if (filters?.daoId) {
    result = result.filter(p => p.daoId === filters.daoId);
  }

  if (filters?.state) {
    result = result.filter(p => p.state === filters.state);
  }

  result.sort((a, b) => b.startTime - a.startTime);

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Get proposal by ID
 */
export function getProposalById(proposalId: string): UnifiedProposal | undefined {
  return proposals.get(proposalId);
}

/**
 * Record a vote
 */
export function recordVote(vote: Omit<VoteRecord, 'id' | 'timestamp'>): VoteRecord {
  const record: VoteRecord = {
    ...vote,
    id: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date().toISOString(),
  };

  voteRecords.unshift(record);

  // Update DAO stats
  const stats = daoStats.get(vote.daoId);
  if (stats) {
    stats.totalVotes++;
    const voters = new Set(voteRecords.filter(v => v.daoId === vote.daoId).map(v => v.voterAddress));
    stats.uniqueVoters = voters.size;
    stats.totalPointsDistributed += vote.pointsEarned;
    stats.lastActivity = new Date().toISOString();
  }

  return record;
}

/**
 * Get vote records (with filters)
 */
export function getVoteRecords(filters?: {
  voterAddress?: string;
  daoId?: string;
  proposalId?: string;
  limit?: number;
}): VoteRecord[] {
  let result = [...voteRecords];

  if (filters?.voterAddress) {
    result = result.filter(v => v.voterAddress.toLowerCase() === filters.voterAddress!.toLowerCase());
  }

  if (filters?.daoId) {
    result = result.filter(v => v.daoId === filters.daoId);
  }

  if (filters?.proposalId) {
    result = result.filter(v => v.proposalId === filters.proposalId);
  }

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Get DAO statistics
 */
export function getDAOStats(daoId: string): DAOStats | undefined {
  return daoStats.get(daoId);
}

/**
 * Get all DAO statistics
 */
export function getAllDAOStats(): DAOStats[] {
  return Array.from(daoStats.values())
    .sort((a, b) => b.totalVotes - a.totalVotes);
}

/**
 * Get platform-wide statistics
 */
export function getPlatformStats() {
  const allStats = Array.from(daoStats.values());

  return {
    daos: {
      total: daoConfigs.size,
      active: Array.from(daoConfigs.values()).filter(d => d.isActive).length,
      byChain: groupBy(Array.from(daoConfigs.values()), 'chain'),
      byTier: groupBy(Array.from(daoConfigs.values()), 'tier'),
    },
    proposals: {
      total: proposals.size,
      active: Array.from(proposals.values()).filter(p => p.state === 'active').length,
      byDAO: groupBy(Array.from(proposals.values()), 'daoId'),
    },
    votes: {
      total: voteRecords.length,
      uniqueVoters: new Set(voteRecords.map(v => v.voterAddress)).size,
      totalPoints: allStats.reduce((sum, s) => sum + s.totalPointsDistributed, 0),
      averagePerProposal: proposals.size > 0 ? Math.floor(voteRecords.length / proposals.size) : 0,
    },
  };
}

/**
 * Sync proposals from Snapshot for all active DAOs
 */
export async function syncAllProposals(): Promise<{ synced: number; errors: string[] }> {
  const activeDAOs = getActiveDAOs().filter(dao => dao.governanceType === 'snapshot' || dao.governanceType === 'both');

  let synced = 0;
  const errors: string[] = [];

  for (const dao of activeDAOs) {
    try {
      if (!dao.snapshotSpace) continue;

      const snapshotProposals = await fetchActiveProposals(dao.snapshotSpace);

      for (const sp of snapshotProposals) {
        const unified: UnifiedProposal = {
          id: sp.id,
          daoId: dao.id,
          daoName: dao.name,
          title: sp.title,
          description: sp.body || '',
          proposer: '', // Snapshot API doesn't provide this in the basic query
          state: sp.state as any,
          governanceType: 'snapshot',
          choices: sp.choices,
          startTime: sp.start,
          endTime: sp.end,
          snapshot: sp.snapshot,
          scores: sp.scores,
          scoresTotal: sp.scores_total,
          voteCount: sp.votes,
          network: sp.network,
          createdAt: new Date(sp.start * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storeProposal(unified);
        synced++;
      }
    } catch (err: any) {
      errors.push(`${dao.id}: ${err.message}`);
    }
  }

  console.log(`🔄 Synced ${synced} proposals from ${activeDAOs.length} DAOs`);
  return { synced, errors };
}

// Helper function
function groupBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Initialize on module load
initializeDAOs();
