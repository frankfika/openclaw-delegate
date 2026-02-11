import { Hono } from 'hono';
import { analyzeProposal, chatWithAgent } from '../services/llm.js';

export const analysisRouter = new Hono();

// POST /api/analysis - analyze a proposal
analysisRouter.post('/analysis', async (c) => {
  try {
    const { proposalText } = await c.req.json();
    if (!proposalText) {
      return c.json({ error: 'proposalText is required' }, 400);
    }
    const result = await analyzeProposal(proposalText);
    return c.json(result);
  } catch (err: any) {
    console.error('Analysis error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/chat - chat with agent
analysisRouter.post('/chat', async (c) => {
  try {
    const { history, context } = await c.req.json();
    if (!history || !context) {
      return c.json({ error: 'history and context are required' }, 400);
    }
    const reply = await chatWithAgent(history, context);
    return c.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});
