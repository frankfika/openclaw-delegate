// Re-export all shared types
export * from '../../../shared/types';

// Server-specific type extensions
import { Proposal } from '../../../shared/types';

// Storage interfaces (for future database implementation)
export interface StorageAdapter {
  // DAO operations
  getDAO(id: string): Promise<DAOConfig | null>;
  getAllDAOs(): Promise<DAOConfig[]>;
  saveDAO(dao: DAOConfig): Promise<void>;

  // Proposal operations
  getProposal(id: string): Promise<Proposal | null>;
  getProposals(filters?: ProposalFilters): Promise<Proposal[]>;
  saveProposal(proposal: Proposal): Promise<void>;

  // Vote operations
  getVotes(filters?: VoteFilters): Promise<VoteRecord[]>;
  saveVote(vote: VoteRecord): Promise<void>;

  // User operations
  getUser(address: string): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<void>;
}

export interface ProposalFilters {
  daoId?: string;
  state?: string;
  governanceType?: string;
  limit?: number;
  offset?: number;
}

export interface VoteFilters {
  voterAddress?: string;
  daoId?: string;
  proposalId?: string;
  limit?: number;
}

// Import needed types
import { DAOConfig, VoteRecord, UserProfile } from '../../../shared/types';
