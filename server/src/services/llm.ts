import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { config } from '../config.js';
import {
  SYSTEM_PROMPTS,
  getAnalysisPrompt,
  getChatContextPrompt,
  getFallbackAnalysis,
  getFallbackChatResponse,
} from './prompts.js';
import { AI_CONFIG } from '../../../shared/config.js';

// Configure proxy agent for DeepSeek API (required for node-fetch compatibility)
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const httpAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

// Initialize OpenAI client (configured for DeepSeek)
const client = new OpenAI({
  apiKey: config.deepseekApiKey,
  baseURL: 'https://api.deepseek.com/v1',
  httpAgent,
  timeout: AI_CONFIG.TIMEOUT_MS,
});

/**
 * Extract JSON from LLM response (handles various formats)
 */
function extractJSON(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // Continue to next attempt
      }
    }

    // Try to find JSON object in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Continue to fallback
      }
    }

    throw new Error('No valid JSON found in response');
  }
}

/**
 * Validate analysis response has required fields
 */
function validateAnalysisResponse(data: any): boolean {
  const requiredFields = [
    'summary',
    'riskLevel',
    'riskAnalysis',
    'strategyMatchScore',
    'strategyReasoning',
    'recommendation',
    'keyPoints',
    'securityChecks',
  ];

  return requiredFields.every(field => field in data);
}

/**
 * Analyze a proposal using AI
 */
export async function analyzeProposal(proposalText: string): Promise<Record<string, any>> {
  const prompt = getAnalysisPrompt(proposalText);

  try {
    const response = await client.chat.completions.create({
      model: AI_CONFIG.DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.ANALYZER },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.DEFAULT_TEMPERATURE,
      max_tokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    const text = response.choices[0]?.message?.content || '';
    const data = extractJSON(text);

    if (!validateAnalysisResponse(data)) {
      console.warn('AI response missing required fields, using partial data');
      // Merge with fallback for missing fields
      const fallback = getFallbackAnalysis();
      return { ...fallback, ...data, partial: true };
    }

    return data;
  } catch (err: any) {
    console.error('AI analysis error:', err.message);
    return getFallbackAnalysis();
  }
}

/**
 * Chat with AI about a proposal
 */
export async function chatWithAgent(
  history: { role: string; content: string }[],
  context: string
): Promise<string> {
  try {
    // Format history for OpenAI
    const formattedHistory = history.map(m => ({
      role: m.role === 'model' || m.role === 'agent' ? 'assistant' : 'user',
      content: m.content,
    }));

    const systemContent = getChatContextPrompt(
      context,
      history.map(h => `${h.role}: ${h.content}`).join('\n')
    );

    const response = await client.chat.completions.create({
      model: AI_CONFIG.DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemContent },
        ...formattedHistory,
      ],
      temperature: AI_CONFIG.CHAT_TEMPERATURE,
      max_tokens: AI_CONFIG.CHAT_MAX_TOKENS,
    });

    return response.choices[0]?.message?.content || getFallbackChatResponse();
  } catch (err: any) {
    console.error('AI chat error:', err.message);
    return getFallbackChatResponse();
  }
}

/**
 * Health check for AI service
 */
export async function checkAIHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    await client.chat.completions.create({
      model: AI_CONFIG.DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });
    return { healthy: true, latency: Date.now() - start };
  } catch (err: any) {
    return { healthy: false, latency: Date.now() - start, error: err.message };
  }
}
