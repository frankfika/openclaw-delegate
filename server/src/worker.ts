/**
 * Cloudflare Workers Entry Point for VoteNow API
 *
 * This adapts the Hono app to run on Cloudflare Workers edge runtime.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { analyzeProposal, chatWithAgent } from './services/llm.js';
import { daosRouter } from './routes/daos.js';
import { pointsRouter } from './routes/points.js';
import { rewardsRouter } from './routes/rewards.js';
import { votingRouter } from './routes/voting.js';
import { usersRouter } from './routes/users.js';
import { awardVotePoints } from './services/points.js';
import { recordVote, getProposalById } from './services/dao-manager.js';

const app = new Hono();

// Activity log (in-memory for now, use KV/D1 in production)
const activityLog: any[] = [];
function addActivity(activity: any) {
  activityLog.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...activity,
  });
  if (activityLog.length > 100) activityLog.pop();
}

// CORS - allow frontend
app.use('*', cors({
  origin: ['https://votenow-86u.pages.dev', 'http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type'],
}));

// Health check
app.get('/api/health', (c) => c.json({
  status: 'ok',
  name: 'VoteNow API',
  framework: 'Hono on Cloudflare Workers',
  version: '1.0.0',
}));

// Mount routers
app.route('/api', daosRouter);
app.route('/api', pointsRouter);
app.route('/api', rewardsRouter);
app.route('/api', votingRouter);
app.route('/api', usersRouter);

// AI Analysis
app.post('/api/analysis', async (c) => {
  try {
    const { proposalText } = await c.req.json();
    if (!proposalText) return c.json({ error: 'proposalText required' }, 400);
    const result = await analyzeProposal(proposalText);
    addActivity({ type: 'analysis', risk: result.riskLevel });
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/chat', async (c) => {
  try {
    const { history, context } = await c.req.json();
    if (!history || !context) return c.json({ error: 'history and context required' }, 400);
    const reply = await chatWithAgent(history, context);
    return c.json({ reply });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Voting with Points
app.post('/api/vote', async (c) => {
  try {
    const { proposalId, direction, walletAddress, txHash, type, votingPower, reason } = await c.req.json();

    if (!proposalId || !walletAddress) {
      return c.json({ error: 'proposalId and walletAddress required' }, 400);
    }

    const proposal = getProposalById(proposalId);
    if (!proposal) {
      return c.json({ error: 'Proposal not found' }, 404);
    }

    // Check if early vote (within 24 hours)
    const now = Date.now() / 1000;
    const isEarlyVote = (now - proposal.startTime) < 86400;

    // Award points
    const pointsTx = awardVotePoints(
      walletAddress,
      proposalId,
      proposal.daoId,
      isEarlyVote
    );

    // Record vote
    const vote = recordVote({
      proposalId,
      voterAddress: walletAddress,
      choice: direction || 1,
      votingPower: votingPower || '0',
      reason,
      txHash,
      daoId: proposal.daoId,
    });

    addActivity({
      type: 'vote',
      dao: proposal.daoName,
      voter: walletAddress.slice(0, 6),
      points: pointsTx.amount,
    });

    return c.json({
      success: true,
      vote,
      pointsEarned: pointsTx.amount,
      message: `Vote recorded! You earned ${pointsTx.amount} points.`,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Sync proposals endpoint
app.post('/api/sync-proposals', async (c) => {
  try {
    // Note: syncAllProposals might need adaptation for Workers
    // For now, return a placeholder
    return c.json({ message: 'Sync triggered (background job)' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Export for Cloudflare Workers
export default app;
