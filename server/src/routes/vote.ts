import { Hono } from 'hono';

export const voteRouter = new Hono();

// In-memory vote tracking for demo
const voteHistory: any[] = [];

// POST /api/vote - record a vote intent
voteRouter.post('/vote', async (c) => {
  try {
    const { proposalId, direction, walletAddress, txHash, type } = await c.req.json();

    const record = {
      id: `vote-${Date.now()}`,
      proposalId,
      direction,
      walletAddress,
      txHash: txHash || null,
      type: type || 'snapshot', // 'snapshot' or 'onchain'
      timestamp: new Date().toISOString(),
      status: txHash ? 'confirmed' : 'pending',
    };

    voteHistory.unshift(record);
    return c.json(record);
  } catch (err: any) {
    console.error('Vote record error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/votes - get vote history
voteRouter.get('/votes', (c) => {
  return c.json(voteHistory);
});
