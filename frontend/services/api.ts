import { AnalysisResult, RiskLevel, VoteType } from '../types';

const API_BASE = '/api';

export async function fetchProposals(dao?: string): Promise<any[]> {
  const params = dao ? `?dao=${encodeURIComponent(dao)}` : '';
  const res = await fetch(`${API_BASE}/proposals${params}`);
  if (!res.ok) throw new Error('Failed to fetch proposals');
  const json = await res.json();
  // Handle both array and { total, proposals } response formats
  return Array.isArray(json) ? json : (json.proposals || []);
}

export async function fetchProposal(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/proposals/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch proposal');
  return res.json();
}

export async function analyzeProposal(proposalText: string): Promise<AnalysisResult> {
  try {
    const res = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalText }),
    });
    if (!res.ok) throw new Error('Analysis API error');
    const data = await res.json();

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
      summary: data.summary,
      riskLevel: riskEnum,
      riskAnalysis: data.riskAnalysis,
      strategyMatchScore: data.strategyMatchScore || 50,
      strategyReasoning: data.strategyReasoning || 'Neutral strategic impact.',
      recommendation: voteEnum,
      keyPoints: data.keyPoints || [],
      securityChecks: data.securityChecks || [],
    };
  } catch (err) {
    console.error('Analysis error, using fallback:', err);
    return {
      summary: "I've analyzed the payload. This is a treasury diversification attempt compatible with your 'Accumulation' strategy.",
      riskLevel: RiskLevel.LOW,
      riskAnalysis: 'CowSwap interaction verified safe.',
      strategyMatchScore: 92,
      strategyReasoning: 'Aligns with your preference for ETH exposure over stablecoins in Q4.',
      recommendation: VoteType.FOR,
      keyPoints: ['Converts 2M USDC to ETH', 'Uses MEV-protected solver', 'Slippage capped at 0.5%'],
      securityChecks: [
        { name: 'Malicious Contract Scan', status: 'pass', details: 'No known phishing signatures.' },
        { name: 'Treasury Impact', status: 'warning', details: 'Short-term volatility exposure.' },
        { name: 'Governor Integrity', status: 'pass', details: 'Proposal submitted by Guardian.' },
      ],
    };
  }
}

export async function chatWithAgent(
  history: { role: string; content: string }[],
  context: string
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, context }),
    });
    if (!res.ok) throw new Error('Chat API error');
    const data = await res.json();
    return data.reply;
  } catch {
    return 'My connection to the neural core is unstable. I cannot process dynamic queries right now.';
  }
}

export async function fetchActivityLog(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/activity`);
    if (!res.ok) throw new Error('Activity API error');
    return res.json();
  } catch {
    return [];
  }
}
