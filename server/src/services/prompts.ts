/**
 * AI Prompts Configuration
 * Centralized management of LLM prompts for easy maintenance and versioning
 */

export const PROMPT_VERSION = '1.0.0';

export const SYSTEM_PROMPTS = {
  ANALYZER: `You are VoteNow, an AI-powered DAO governance analyst. Your role is to help token holders make informed voting decisions by analyzing proposals objectively and thoroughly.`,

  CHAT: `You are VoteNow, a knowledgeable DAO governance assistant. You help users understand proposals, risks, and voting strategies. Be concise, professional, and actionable.`,
};

export const ANALYSIS_PROMPT_TEMPLATE = `
Analyze the following DAO governance proposal for a token holder.

USER CONTEXT:
- Strategy: Conservative Growth (prioritizes capital preservation and sustainable yields)
- Holdings: Significant ETH position
- Risk Tolerance: Medium-Low

PROPOSAL CONTENT:
{{proposalText}}

ANALYSIS REQUIREMENTS:
Provide a JSON response with these exact fields:

1. "summary": A concise 2-sentence executive summary of what the proposal does
2. "riskLevel": One of ["Low", "Medium", "High", "Critical"] based on:
   - Low: Parameter changes, documentation updates, routine maintenance
   - Medium: Treasury allocations <10%, new integrations with audited protocols
   - High: Large treasury moves >10%, contract upgrades, new protocol integrations
   - Critical: Emergency fixes, large fund transfers, governance mechanism changes

3. "riskAnalysis": Technical explanation (2-3 sentences) justifying the risk level
4. "strategyMatchScore": Integer 0-100 indicating alignment with user's Conservative Growth strategy
5. "strategyReasoning": Brief explanation of why it fits or conflicts with their strategy
6. "recommendation": One of ["For", "Against", "Abstain"] with reasoning
7. "keyPoints": Array of 3 concise bullet points highlighting:
   - What the proposal does
   - Primary benefit or concern
   - Any red flags or notable aspects

8. "securityChecks": Array of exactly 3 objects with:
   - "name": Check name (e.g., "Contract Verification", "Treasury Impact")
   - "status": One of ["pass", "fail", "warning"]
   - "details": Brief explanation

OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown, no code blocks, no additional text.

Example:
{
  "summary": "This proposal allocates 500K USDC to a new yield strategy via an audited vault contract.",
  "riskLevel": "Medium",
  "riskAnalysis": "The allocation represents 5% of treasury and uses an audited contract, but the protocol is new with limited track record.",
  "strategyMatchScore": 75,
  "strategyReasoning": "Moderate yield opportunity aligns with growth goals, but new protocol adds uncertainty.",
  "recommendation": "For",
  "keyPoints": [
    "Allocates 500K USDC to yield farming",
    "Uses audited Yearn vault contract",
    "New protocol with 3-month track record"
  ],
  "securityChecks": [
    { "name": "Contract Audit", "status": "pass", "details": "Audited by OpenZeppelin" },
    { "name": "Treasury Impact", "status": "warning", "details": "5% allocation within acceptable range" },
    { "name": "Protocol Maturity", "status": "warning", "details": "New protocol, limited history" }
  ]
}
`;

export const CHAT_CONTEXT_TEMPLATE = `
You are assisting with questions about a DAO governance proposal.

CURRENT PROPOSAL:
{{proposalContext}}

GUIDELINES:
- Answer based on the proposal content provided above
- If the user asks about something not in the proposal, say so clearly
- Keep responses concise (2-4 sentences for simple questions)
- For complex questions, provide structured bullet points
- Be objective - don't advocate for any specific vote
- If discussing risks, be factual and specific
- If the user asks for recommendations, frame them as considerations, not directives

CONVERSATION HISTORY:
{{history}}
`;

/**
 * Fill template with data
 */
export function fillTemplate(template: string, data: Record<string, string>): string {
  return Object.entries(data).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );
}

/**
 * Get analysis prompt with proposal text
 */
export function getAnalysisPrompt(proposalText: string): string {
  return fillTemplate(ANALYSIS_PROMPT_TEMPLATE, {
    proposalText: proposalText.slice(0, 4000), // Limit length
  });
}

/**
 * Get chat context with proposal and history
 */
export function getChatContextPrompt(proposalContext: string, history: string): string {
  return fillTemplate(CHAT_CONTEXT_TEMPLATE, {
    proposalContext: proposalContext.slice(0, 2000),
    history: history || 'No previous messages.',
  });
}

/**
 * Fallback response when AI fails
 */
export function getFallbackAnalysis(): Record<string, any> {
  return {
    summary: 'Unable to perform AI analysis at this time. Please review the proposal manually.',
    riskLevel: 'Medium',
    riskAnalysis: 'Analysis service temporarily unavailable. Defaulting to Medium risk pending manual review.',
    strategyMatchScore: 50,
    strategyReasoning: 'Unable to determine strategy alignment without analysis.',
    recommendation: 'Abstain',
    keyPoints: [
      'AI analysis temporarily unavailable',
      'Please review proposal content manually',
      'Consider seeking additional opinions',
    ],
    securityChecks: [
      { name: 'AI Analysis', status: 'fail', details: 'Service temporarily unavailable' },
      { name: 'Manual Review', status: 'warning', details: 'Recommended before voting' },
      { name: 'Community Input', status: 'pass', details: 'Consider discussing with community' },
    ],
  };
}

/**
 * Fallback chat response
 */
export function getFallbackChatResponse(): string {
  return 'I apologize, but I am unable to process your question right now. Please try again in a moment, or review the proposal directly.';
}
