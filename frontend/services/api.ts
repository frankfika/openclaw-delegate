import { AnalysisResult, RiskLevel, VoteType } from '../types';

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? 'https://votenow-api.chenpitang2020.workers.dev/api'
    : '/api'
);

/**
 * Standard error handler for API calls
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

// ============ Proposal APIs ============

export async function fetchProposals(dao?: string): Promise<any[]> {
  const url = buildUrl('/proposals', dao ? { dao } : undefined);
  const res = await fetch(url);
  const data = await handleResponse<any[] | { proposals: any[] }>(res);
  return Array.isArray(data) ? data : (data.proposals || []);
}

export async function fetchProposal(id: string): Promise<any> {
  const url = buildUrl(`/proposals/${encodeURIComponent(id)}`);
  const res = await fetch(url);
  return handleResponse(res);
}

// ============ Analysis APIs ============

export async function analyzeProposal(proposalText: string): Promise<AnalysisResult> {
  try {
    const res = await fetch(buildUrl('/analysis'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalText }),
    });

    const data = await handleResponse<Record<string, any>>(res);
    return mapAnalysisResult(data);
  } catch (err) {
    console.error('Analysis API error:', err);
    return getFallbackAnalysis();
  }
}

function mapAnalysisResult(data: Record<string, any>): AnalysisResult {
  // Map string enums
  let riskEnum = RiskLevel.MEDIUM;
  switch (data.riskLevel) {
    case 'Low': riskEnum = RiskLevel.LOW; break;
    case 'High': riskEnum = RiskLevel.HIGH; break;
    case 'Critical': riskEnum = RiskLevel.CRITICAL; break;
  }

  let voteEnum = VoteType.ABSTAIN;
  switch (data.recommendation) {
    case 'For': voteEnum = VoteType.FOR; break;
    case 'Against': voteEnum = VoteType.AGAINST; break;
  }

  return {
    summary: data.summary || 'Analysis unavailable',
    riskLevel: riskEnum,
    riskAnalysis: data.riskAnalysis || 'No risk analysis available',
    strategyMatchScore: Math.min(100, Math.max(0, data.strategyMatchScore || 50)),
    strategyReasoning: data.strategyReasoning || 'No strategy reasoning available',
    recommendation: voteEnum,
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    securityChecks: Array.isArray(data.securityChecks) ? data.securityChecks : [],
  };
}

function getFallbackAnalysis(): AnalysisResult {
  return {
    summary: 'AI analysis temporarily unavailable. Please review the proposal manually.',
    riskLevel: RiskLevel.MEDIUM,
    riskAnalysis: 'Unable to perform automated risk analysis at this time.',
    strategyMatchScore: 50,
    strategyReasoning: 'Strategy alignment cannot be determined without analysis.',
    recommendation: VoteType.ABSTAIN,
    keyPoints: [
      'AI analysis temporarily unavailable',
      'Please review proposal content manually',
      'Consider seeking community input',
    ],
    securityChecks: [
      { name: 'AI Analysis', status: 'warning', details: 'Service temporarily unavailable' },
      { name: 'Manual Review', status: 'pass', details: 'Recommended before voting' },
      { name: 'Community Input', status: 'pass', details: 'Consider discussing with community' },
    ],
  };
}

// ============ Chat APIs ============

export async function chatWithAgent(
  history: { role: string; content: string }[],
  context: string
): Promise<string> {
  try {
    const res = await fetch(buildUrl('/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, context }),
    });

    const data = await handleResponse<{ reply: string }>(res);
    return data.reply || 'No response generated';
  } catch (err) {
    console.error('Chat API error:', err);
    return 'Unable to connect to AI service. Please try again later.';
  }
}

// ============ Activity APIs ============

export async function fetchActivityLog(): Promise<any[]> {
  try {
    const res = await fetch(buildUrl('/activity'));
    return handleResponse(res);
  } catch (err) {
    console.error('Activity API error:', err);
    return [];
  }
}

// ============ Points & Rewards APIs ============

export async function fetchUserPoints(address: string): Promise<any> {
  const url = buildUrl(`/points/${address}`);
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchUserDashboard(address: string): Promise<any> {
  const url = buildUrl(`/users/${address}/dashboard`);
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchLeaderboard(limit = 20): Promise<any[]> {
  const url = buildUrl('/leaderboard', { limit: String(limit) });
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchRewards(): Promise<any[]> {
  const url = buildUrl('/rewards', { active: 'true' });
  const res = await fetch(url);
  return handleResponse(res);
}

export async function redeemReward(address: string, rewardId: string): Promise<any> {
  const url = buildUrl(`/rewards/${rewardId}/redeem`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: address }),
  });
  return handleResponse(res);
}

export async function fetchRedemptions(address: string): Promise<any[]> {
  const url = buildUrl(`/redemptions/user/${address}`);
  const res = await fetch(url);
  return handleResponse(res);
}

// ============ Vote APIs ============

export async function submitVote(
  proposalId: string,
  choice: number,
  signature: string,
  metadata?: Record<string, any>
): Promise<any> {
  const url = buildUrl('/votes');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposalId,
      choice,
      signature,
      ...metadata,
    }),
  });
  return handleResponse(res);
}

// ============ Health Check ============

export async function checkAPIHealth(): Promise<{ healthy: boolean; latency?: number }> {
  const start = Date.now();
  try {
    const res = await fetch(buildUrl('/health'));
    return {
      healthy: res.ok,
      latency: Date.now() - start,
    };
  } catch {
    return { healthy: false, latency: Date.now() - start };
  }
}
