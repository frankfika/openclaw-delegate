/**
 * Dashboard API Server — runs as an OpenClaw plugin service.
 *
 * Provides the HTTP API that the React frontend consumes.
 * This replaces the standalone Hono server entry point.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { analyzeProposal, chatWithAgent } from './llm.js';
import { daosRouter } from '../routes/daos.js';
import { pointsRouter } from '../routes/points.js';
import { rewardsRouter } from '../routes/rewards.js';
import { votingRouter } from '../routes/voting.js';
import { usersRouter } from '../routes/users.js';
import { awardVotePoints } from './points.js';
import { recordVote, getProposalById, syncAllProposals } from './dao-manager.js';

let server: any = null;

interface DashboardContext {
  voteIntents: any[];
  activityLog: any[];
  addActivity: (activity: any) => void;
}

export async function startDashboardServer(port: number, ctx: DashboardContext) {
  const app = new Hono();

  // CORS — allow frontend
  app.use('*', cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type'],
  }));

  // Health check
  app.get('/api/health', (c) => c.json({
    status: 'ok',
    name: 'OpenClaw Delegate',
    framework: 'OpenClaw Plugin',
    version: '1.0.0',
  }));

  // Mount new routers for full platform functionality
  app.route('/api', daosRouter);
  app.route('/api', pointsRouter);
  app.route('/api', rewardsRouter);
  app.route('/api', votingRouter);
  app.route('/api', usersRouter);

  // ─── AI Analysis ────────────────────────────────────────────────
  app.post('/api/analysis', async (c) => {
    try {
      const { proposalText } = await c.req.json();
      if (!proposalText) return c.json({ error: 'proposalText required' }, 400);
      const result = await analyzeProposal(proposalText);
      ctx.addActivity({ type: 'analysis', risk: result.riskLevel });
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

  // ─── Voting (with Points Integration) ──────────────────────────
  app.post('/api/vote', async (c) => {
    try {
      const { proposalId, direction, walletAddress, txHash, type, votingPower, reason } = await c.req.json();

      if (!proposalId || !walletAddress) {
        return c.json({ error: 'proposalId and walletAddress required' }, 400);
      }

      // Get proposal to determine DAO
      const proposal = getProposalById(proposalId);
      if (!proposal) {
        return c.json({ error: 'Proposal not found' }, 404);
      }

      // Check if this is an early vote (within first 24 hours)
      const now = Date.now() / 1000;
      const isEarlyVote = (now - proposal.startTime) < 86400;

      // Award points for voting
      const pointsTx = awardVotePoints(
        walletAddress,
        proposalId,
        proposal.daoId,
        isEarlyVote
      );

      // Record the vote in DAO manager
      const voteRecord = recordVote({
        proposalId,
        daoId: proposal.daoId,
        voterAddress: walletAddress,
        choice: typeof direction === 'number' ? direction : 0,
        votingPower: votingPower || '0',
        reason,
        txHash,
        pointsEarned: pointsTx.amount,
      });

      // Legacy vote intent record for compatibility
      const record = {
        id: voteRecord.id,
        proposalId,
        direction,
        walletAddress,
        txHash: txHash || null,
        type: type || 'snapshot',
        timestamp: voteRecord.timestamp,
        status: txHash ? 'confirmed' : 'pending',
        pointsEarned: pointsTx.amount,
      };

      ctx.voteIntents.unshift(record);
      ctx.addActivity({
        type: 'vote',
        proposalId,
        direction,
        dao: proposal.daoName,
        pointsEarned: pointsTx.amount,
      });

      return c.json({
        vote: record,
        points: pointsTx,
      });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

  // ─── Activity Log ──────���────────────────────────────────────────
  app.get('/api/activity', (c) => c.json(ctx.activityLog));

  // Start server
  server = serve({ fetch: app.fetch, port }, () => {
    console.log(`✅ OpenClaw Delegate dashboard at http://localhost:${port}`);
  });

  // Sync proposals from Snapshot on startup so in-memory data is available
  syncAllProposals().then(result => {
    console.log(`🔄 Initial sync complete: ${result.synced} proposals loaded`);
    if (result.errors.length > 0) {
      console.warn(`⚠️ Sync errors: ${result.errors.join(', ')}`);
    }
  }).catch(err => {
    console.error('❌ Initial proposal sync failed:', err.message);
  });
}

export async function stopDashboardServer() {
  if (server) {
    server.close?.();
    server = null;
  }
}
