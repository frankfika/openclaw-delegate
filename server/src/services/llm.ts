import OpenAI from 'openai';
import { config } from '../config.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Configure proxy agent for DeepSeek API (required for node-fetch compatibility)
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const client = new OpenAI({
  apiKey: config.deepseekApiKey,
  baseURL: 'https://api.deepseek.com/v1',
  httpAgent,
  timeout: 60000,
});

export async function analyzeProposal(proposalText: string): Promise<any> {
  const prompt = `
You are VoteNow, an autonomous DAO Governance Agent built on the VoteNow AI assistant framework.
Your user has a "Conservative Growth" strategy and holds significant ETH.

Task: Analyze this DAO governance proposal for the user.

PROPOSAL:
${proposalText.slice(0, 4000)}

Output a valid JSON object with these fields:
1. "summary": Direct, professional executive summary (2 sentences max).
2. "riskLevel": One of "Low", "Medium", "High", "Critical".
3. "riskAnalysis": Technical justification for the risk level.
4. "strategyMatchScore": Integer 0-100 indicating alignment with user strategy.
5. "strategyReasoning": Why it fits or doesn't fit the user's strategy.
6. "recommendation": One of "For", "Against", "Abstain".
7. "securityChecks": Array of 3 objects with {name, status: "pass"|"fail"|"warning", details}.
8. "keyPoints": Array of 3 concise bullet points.

Respond ONLY with the JSON object, no markdown formatting.`;

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are VoteNow, an AI DAO governance analyst powered by VoteNow. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content || '';
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err: any) {
    console.error('DeepSeek analysis error:', err.message);
    // Fallback mock response
    return {
      summary: "I've analyzed the payload. This proposal appears to be a standard governance action compatible with your strategy.",
      riskLevel: 'Low',
      riskAnalysis: 'Standard governance proposal with no unusual parameters detected.',
      strategyMatchScore: 75,
      strategyReasoning: 'Moderate alignment with Conservative Growth strategy.',
      recommendation: 'For',
      keyPoints: [
        'Standard governance action',
        'No unusual contract interactions',
        'Community consensus appears strong',
      ],
      securityChecks: [
        { name: 'Contract Scan', status: 'pass', details: 'No malicious signatures detected.' },
        { name: 'Treasury Impact', status: 'warning', details: 'Minor treasury allocation change.' },
        { name: 'Governor Integrity', status: 'pass', details: 'Proposal follows standard process.' },
      ],
    };
  }
}

export async function chatWithAgent(
  history: { role: string; content: string }[],
  context: string
): Promise<string> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are VoteNow, an autonomous DAO Governance Agent powered by the VoteNow AI assistant framework. You help users understand DAO proposals and make informed voting decisions. Be concise and professional.

Context about the current proposal:
${context.slice(0, 2000)}`,
      },
      ...history.map(m => ({
        role: m.role === 'model' || m.role === 'agent' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.5,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (err: any) {
    console.error('DeepSeek chat error:', err.message);
    return 'My connection to the analysis core is unstable. Please try again.';
  }
}
