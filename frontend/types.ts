export enum ProposalStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  PASSED = 'Passed',
  REJECTED = 'Rejected',
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

export interface Proposal {
  id: string;
  daoName: string;
  source: 'Snapshot' | 'OnChain';
  title: string;
  description: string;
  fullContent: string;
  status: ProposalStatus;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  participationRate: number;
  tags: string[];
  // Snapshot-specific fields
  displayId?: string;
  snapshotId?: string;
  spaceId?: string;
  choices?: string[];
  snapshotNetwork?: string;
  snapshot?: string;
  type?: string;
}

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
  securityChecks: SecurityCheck[]; // Simulated GoPlus/Contract scan
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  type?: 'text' | 'analysis' | 'intent-action'; // Added intent-action
  data?: any;
  timestamp: number;
}

export interface AgentActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'warning' | 'neutral';
}
