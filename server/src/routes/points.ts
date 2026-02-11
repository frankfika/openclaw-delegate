/**
 * Points System API Routes
 */

import { Hono } from 'hono';
import {
  getUserPoints,
  getUserTransactions,
  getUserStats,
  getLeaderboard,
  getPlatformStats as getPointsPlatformStats,
  awardVotePoints,
  redeemPoints,
  awardBonusPoints,
} from '../services/points.js';

export const pointsRouter = new Hono();

// GET /api/points/:address - Get user points
pointsRouter.get('/points/:address', (c) => {
  const address = c.req.param('address');
  const points = getUserPoints(address);

  return c.json(points);
});

// GET /api/points/:address/stats - Get detailed user stats
pointsRouter.get('/points/:address/stats', (c) => {
  const address = c.req.param('address');
  const stats = getUserStats(address);

  return c.json(stats);
});

// GET /api/points/:address/history - Get user transaction history
pointsRouter.get('/points/:address/history', (c) => {
  const address = c.req.param('address');
  const limit = parseInt(c.req.query('limit') || '50');

  const transactions = getUserTransactions(address, limit);

  return c.json({
    total: transactions.length,
    transactions,
  });
});

// GET /api/leaderboard - Get points leaderboard
pointsRouter.get('/leaderboard', (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const leaderboard = getLeaderboard(limit);

  return c.json({
    total: leaderboard.length,
    leaderboard,
  });
});

// GET /api/points-stats - Get platform points statistics
pointsRouter.get('/points-stats', (c) => {
  const stats = getPointsPlatformStats();
  return c.json(stats);
});

// POST /api/points/award - Award points for voting (internal use)
pointsRouter.post('/points/award', async (c) => {
  try {
    const { walletAddress, proposalId, daoSpace, isEarlyVote } = await c.req.json();

    if (!walletAddress || !proposalId || !daoSpace) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const transaction = awardVotePoints(walletAddress, proposalId, daoSpace, isEarlyVote);

    return c.json(transaction);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/points/redeem - Redeem points for rewards
pointsRouter.post('/points/redeem', async (c) => {
  try {
    const { walletAddress, amount, reason } = await c.req.json();

    if (!walletAddress || !amount || !reason) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const transaction = redeemPoints(walletAddress, amount, reason);

    return c.json(transaction);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/points/bonus - Award bonus points (admin only)
pointsRouter.post('/points/bonus', async (c) => {
  try {
    const { walletAddress, amount, reason } = await c.req.json();

    if (!walletAddress || !amount || !reason) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const transaction = awardBonusPoints(walletAddress, amount, reason);

    return c.json(transaction);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
