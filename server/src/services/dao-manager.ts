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

import {
  DAOConfig,
  Proposal,
  ProposalState,
  ProposalStatus,
  GovernanceType,
  DAOStats,
  VoteRecord,
  PlatformStats,
} from '../types/index.js';

import {
  DAO_CONFIGS,
  getDAOBySpaceId,
  getPointsForDAO,
  getDAOById as getDAOFromConfig,
} from '../../../shared/config.js';

import { fetchActiveProposals, fetchRecentProposals, SnapshotProposal } from './snapshot.js';

// ============ In-memory Storage (replace with database in production) ============

class MemoryStorage {
  private daoConfigs = new Map<string, DAOConfig>();
  private proposals = new Map<string, Proposal>();
  private voteRecords: VoteRecord[] = [];
  private daoStats = new Map<string, DAOStats>();

  constructor() {
    this.initializeDAOs();
  }

  private initializeDAOs() {
    for (const dao of DAO_CONFIGS) {
      this.addDAO({
        ...dao,
        addedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ Initialized ${DAO_CONFIGS.length} DAOs`);
  }

  // DAO Operations
  addDAO(config: DAOConfig): void {
    this.daoConfigs.set(config.id, config);

    // Initialize stats if not exists
    if (!this.daoStats.has(config.id)) {
      this.daoStats.set(config.id, {
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

  getAllDAOs(): DAOConfig[] {
    return Array.from(this.daoConfigs.values());
  }

  getActiveDAOs(): DAOConfig[] {
    return this.getAllDAOs().filter(dao => dao.isActive);
  }

  getDAOById(id: string): DAOConfig | undefined {
    return this.daoConfigs.get(id);
  }

  getDAOsByChain(chain: string): DAOConfig[] {
    return this.getAllDAOs().filter(dao => dao.chain === chain);
  }

  getDAOsByTier(tier: number): DAOConfig[] {
    return this.getAllDAOs().filter(dao => dao.tier === tier);
  }

  updateDAO(daoId: string, updates: Partial<DAOConfig>): DAOConfig | null {
    const dao = this.daoConfigs.get(daoId);
    if (!dao) return null;

    const updated = { ...dao, ...updates };
    this.daoConfigs.set(daoId, updated);
    return updated;
  }

  // Proposal Operations
  storeProposal(proposal: Proposal): void {
    this.proposals.set(proposal.id, proposal);
    this.updateDAOStats(proposal.daoId);
  }

  getProposals(filters?: {
    daoId?: string;
    state?: ProposalState;
    governanceType?: GovernanceType;
    limit?: number;
    offset?: number;
  }): Proposal[] {
    let result = Array.from(this.proposals.values());

    if (filters?.daoId) {
      result = result.filter(p => p.daoId === filters.daoId);
    }

    if (filters?.state) {
      result = result.filter(p => p.state === filters.state);
    }

    if (filters?.governanceType) {
      result = result.filter(p => p.governanceType === filters.governanceType);
    }

    // Sort by start time (newest first)
    result.sort((a, b) => b.startTime - a.startTime);

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit;

    if (limit) {
      result = result.slice(offset, offset + limit);
    } else if (offset) {
      result = result.slice(offset);
    }

    return result;
  }

  getProposalById(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  // Vote Operations
  recordVote(vote: Omit<VoteRecord, 'id' | 'timestamp'>): VoteRecord {
    const record: VoteRecord = {
      ...vote,
      id: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
    };

    this.voteRecords.unshift(record);
    this.updateVoteStats(record);

    return record;
  }

  getVoteRecords(filters?: {
    voterAddress?: string;
    daoId?: string;
    proposalId?: string;
    limit?: number;
  }): VoteRecord[] {
    let result = [...this.voteRecords];

    if (filters?.voterAddress) {
      const addr = filters.voterAddress.toLowerCase();
      result = result.filter(v => v.voterAddress.toLowerCase() === addr);
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

  // Stats Operations
  getDAOStats(daoId: string): DAOStats | undefined {
    return this.daoStats.get(daoId);
  }

  getAllDAOStats(): DAOStats[] {
    return Array.from(this.daoStats.values())
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }

  getPlatformStats(): PlatformStats {
    const allDAOs = this.getAllDAOs();
    const allProposals = this.getProposals();
    const allVotes = this.voteRecords;

    return {
      daos: {
        total: allDAOs.length,
        active: allDAOs.filter(d => d.isActive).length,
        byChain: this.groupBy(allDAOs, 'chain'),
        byTier: this.groupBy(allDAOs, 'tier'),
      },
      proposals: {
        total: allProposals.length,
        active: allProposals.filter(p => p.state === ProposalState.ACTIVE).length,
        byDAO: this.groupBy(allProposals, 'daoId'),
      },
      votes: {
        total: allVotes.length,
        uniqueVoters: new Set(allVotes.map(v => v.voterAddress.toLowerCase())).size,
        totalPoints: Array.from(this.daoStats.values())
          .reduce((sum, s) => sum + s.totalPointsDistributed, 0),
        averagePerProposal: allProposals.length > 0
          ? Math.floor(allVotes.length / allProposals.length)
          : 0,
      },
    };
  }

  // Private helpers
  private updateDAOStats(daoId: string) {
    const stats = this.daoStats.get(daoId);
    if (!stats) return;

    const daoProposals = this.getProposals({ daoId });
    stats.totalProposals = daoProposals.length;
    stats.activeProposals = daoProposals.filter(p => p.state === ProposalState.ACTIVE).length;
    stats.lastActivity = new Date().toISOString();
  }

  private updateVoteStats(vote: VoteRecord) {
    const stats = this.daoStats.get(vote.daoId);
    if (!stats) return;

    stats.totalVotes++;
    stats.totalPointsDistributed += vote.pointsEarned;

    const daoVotes = this.voteRecords.filter(v => v.daoId === vote.daoId);
    const uniqueVoters = new Set(daoVotes.map(v => v.voterAddress.toLowerCase()));
    stats.uniqueVoters = uniqueVoters.size;
    stats.lastActivity = new Date().toISOString();
  }

  private groupBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, number> {
    return arr.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const storage = new MemoryStorage();

// ============ Proposal Synchronization ============

/**
 * Map Snapshot state to our ProposalState
 */
function mapSnapshotState(snapshotState: string): ProposalState {
  switch (snapshotState) {
    case 'active': return ProposalState.ACTIVE;
    case 'closed': return ProposalState.CLOSED;
    case 'pending': return ProposalState.PENDING;
    default: return ProposalState.PENDING;
  }
}

/**
 * Determine ProposalStatus from state and scores
 */
function determineStatus(
  state: ProposalState,
  scores: number[],
  scoresTotal: number
): ProposalStatus {
  if (state === ProposalState.ACTIVE) return ProposalStatus.ACTIVE;
  if (state === ProposalState.PENDING) return ProposalStatus.PENDING;

  // For closed proposals, determine if passed or rejected
  if (state === ProposalState.CLOSED && scores.length >= 2) {
    // Simple majority: first choice (usually "For") vs second (usually "Against")
    const forScore = scores[0] || 0;
    const againstScore = scores[1] || 0;
    return forScore > againstScore ? ProposalStatus.PASSED : ProposalStatus.REJECTED;
  }

  return ProposalStatus.PENDING;
}

/**
 * Convert Snapshot proposal to our Proposal format
 */
function convertSnapshotProposal(sp: SnapshotProposal): Proposal | null {
  const dao = getDAOBySpaceId(sp.space.id);
  if (!dao) return null;

  const state = mapSnapshotState(sp.state);
  const status = determineStatus(state, sp.scores, sp.scores_total);

  return {
    id: sp.id,
    daoId: dao.id,
    daoName: dao.name,
    title: sp.title,
    description: (sp.body || '').slice(0, 200),
    fullContent: sp.body || '',
    state,
    status,
    governanceType: GovernanceType.SNAPSHOT,
    startTime: sp.start,
    endTime: sp.end,
    snapshotBlock: sp.snapshot,
    network: sp.network,
    choices: sp.choices,
    scores: sp.scores,
    scoresTotal: sp.scores_total,
    voteCount: sp.votes,
    type: sp.type,
    createdAt: new Date(sp.start * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    // UI helpers
    displayId: sp.id.slice(0, 8),
  } as Proposal;
}

/**
 * Sync proposals from Snapshot for all active DAOs
 */
export async function syncAllProposals(): Promise<{ synced: number; errors: string[] }> {
  const activeDAOs = storage.getActiveDAOs()
    .filter(dao => dao.governanceType === GovernanceType.SNAPSHOT ||
                   dao.governanceType === GovernanceType.BOTH);

  let synced = 0;
  const errors: string[] = [];

  try {
    const allProposals = await fetchRecentProposals(50);

    for (const sp of allProposals) {
      const proposal = convertSnapshotProposal(sp);
      if (!proposal) continue;

      storage.storeProposal(proposal);
      synced++;
    }
  } catch (err: any) {
    errors.push(`Sync error: ${err.message}`);
  }

  console.log(`🔄 Synced ${synced} proposals from ${activeDAOs.length} DAOs`);
  return { synced, errors };
}

// ============ Re-export functions for backward compatibility ============

export const {
  addDAO,
  getAllDAOs,
  getActiveDAOs,
  getDAOById,
  getDAOsByChain,
  getDAOsByTier,
  updateDAO,
  storeProposal,
  getProposals,
  getProposalById,
  recordVote,
  getVoteRecords,
  getDAOStats,
  getAllDAOStats,
  getPlatformStats,
} = storage;

// Export config helpers
export { getDAOFromConfig as getDAOConfig, getPointsForDAO };
