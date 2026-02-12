/**
 * Shared Type Definitions
 * Used by both frontend and backend
 */

// ============ Enums ============

export enum ProposalState {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
  EXECUTED = 'executed',
  DEFEATED = 'defeated',
  QUEUED = 'queued',
}

export enum ProposalStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  PASSED = 'Passed',
  REJECTED = 'Rejected',
  EXECUTED = 'Executed',
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
  UNKNOWN = 'Scanning...',
}

export enum VoteType {
  FOR = 'For',
  AGAINST = 'Against',
  ABSTAIN = 'Abstain',
}

export enum GovernanceType {
  SNAPSHOT = 'snapshot',
  ONCHAIN = 'onchain',
  BOTH = 'both',
}

// ============ Base Types ============

export interface BaseProposal {
  id: string;
  daoId: string;
  daoName: string;
  title: string;
  description: string;
  fullContent: string;
  state: ProposalState;
  status: ProposalStatus;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  createdAt: string;
  updatedAt: string;
  tags: string[];
  endDate: string;
}

// ============ Snapshot-specific Types ============

export interface SnapshotProposal extends BaseProposal {
  governanceType: GovernanceType.SNAPSHOT;
  snapshotId: string;
  spaceId: string;
  choices: string[];
  snapshotBlock: string; // Block number at snapshot
  network: string; // Chain ID (1, 137, 42161, etc.)
  scores: number[];
  scoresTotal: number;
  voteCount: number;
  type: string;
  // UI helpers
  displayId: string;
}

// ============ OnChain-specific Types ============

export interface OnChainProposal extends BaseProposal {
  governanceType: GovernanceType.ONCHAIN;
  governorAddress: string;
  proposalId: string;
  chainId: number;
  quorum: number;
  quorumReached: boolean;
  // Vote counts
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  // UI helpers
  displayId: string;
}

// ============ Union Type ============

export type Proposal = SnapshotProposal | OnChainProposal;

// Type guards
export function isSnapshotProposal(p: Proposal): p is SnapshotProposal {
  return p.governanceType === GovernanceType.SNAPSHOT;
}

export function isOnChainProposal(p: Proposal): p is OnChainProposal {
  return p.governanceType === GovernanceType.ONCHAIN;
}

// ============ Analysis Types ============

export interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface AnalysisResult {
  summary: string;
  riskLevel: RiskLevel;
  riskAnalysis: string;
  strategyMatchScore: number; // 0-100
  strategyReasoning: string;
  recommendation: VoteType;
  keyPoints: string[];
  securityChecks: SecurityCheck[];
}

// ============ Chat Types ============

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  type?: 'text' | 'analysis' | 'intent-action';
  data?: AnalysisResult;
  timestamp: number;
}

// ============ DAO Types ============

export interface DAOMetadata {
  website?: string;
  description?: string;
  logo?: string;
  socials?: {
    twitter?: string;
    discord?: string;
    forum?: string;
  };
}

export interface DAOConfig {
  id: string; // Unique identifier (e.g., 'aave.eth')
  name: string; // Display name
  chain: string; // Primary blockchain
  governanceType: GovernanceType;
  snapshotSpace?: string; // Snapshot space ID
  governorAddress?: string; // On-chain governor contract
  tokenAddress?: string; // Governance token address
  tier: number; // 1-5 based on importance
  pointsPerVote: number; // Base points awarded
  isActive: boolean;
  metadata: DAOMetadata;
  addedAt: string;
  // Chain support
  supportedChains?: number[]; // For multi-chain DAOs
}

// ============ Voting Types ============

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

export interface VoteSubmission {
  proposalId: string;
  choice: number;
  reason?: string;
}

// ============ Stats Types ============

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

export interface PlatformStats {
  daos: {
    total: number;
    active: number;
    byChain: Record<string, number>;
    byTier: Record<string, number>;
  };
  proposals: {
    total: number;
    active: number;
    byDAO: Record<string, number>;
  };
  votes: {
    total: number;
    uniqueVoters: number;
    totalPoints: number;
    averagePerProposal: number;
  };
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: {
    timestamp: string;
    requestId: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

// ============ User Types ============

export interface UserProfile {
  address: string;
  totalPoints: number;
  votesCast: number;
  daosParticipated: string[];
  joinedAt: string;
  lastActive: string;
}

export interface UserDashboard {
  profile: UserProfile;
  recentVotes: VoteRecord[];
  availableRewards: Reward[];
  governanceScore: number;
}

// ============ Reward Types ============

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'token' | 'nft' | 'gas' | 'merch';
  isActive: boolean;
  metadata?: {
    tokenAddress?: string;
    amount?: string;
    image?: string;
  };
}

export interface Redemption {
  id: string;
  userAddress: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  txHash?: string;
}
