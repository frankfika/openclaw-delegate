/**
 * Rewards Distribution API Routes
 */

import { Hono } from 'hono';
import {
  getAllRewards,
  getRewardById,
  redeemReward,
  processRedemption,
  getUserRedemptions,
  getAllRedemptions,
  getRedemptionById,
  cancelRedemption,
  getRewardPool,
  updateRewardPoolBudget,
  getRewardStats,
  addReward,
  updateReward,
} from '../services/rewards.js';

export const rewardsRouter = new Hono();

// GET /api/rewards - Get all rewards
rewardsRouter.get('/rewards', (c) => {
  const type = c.req.query('type') as any;
  const activeOnly = c.req.query('active') === 'true';
  const maxPoints = c.req.query('maxPoints') ? parseInt(c.req.query('maxPoints')!) : undefined;

  const rewards = getAllRewards({ type, activeOnly, maxPoints });

  return c.json({
    total: rewards.length,
    rewards,
  });
});

// GET /api/rewards/:id - Get specific reward
rewardsRouter.get('/rewards/:id', (c) => {
  const rewardId = c.req.param('id');
  const reward = getRewardById(rewardId);

  if (!reward) {
    return c.json({ error: 'Reward not found' }, 404);
  }

  return c.json(reward);
});

// ⚠️ DEV ONLY: POST /api/rewards - Add new reward (admin, no auth)
rewardsRouter.post('/rewards', async (c) => {
  try {
    const rewardData = await c.req.json();

    if (!rewardData.id || !rewardData.name || !rewardData.type || !rewardData.pointsCost) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reward = addReward(rewardData);
    return c.json(reward);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/rewards/:id - Update reward (admin)
rewardsRouter.put('/rewards/:id', async (c) => {
  try {
    const rewardId = c.req.param('id');
    const updates = await c.req.json();

    const reward = updateReward(rewardId, updates);

    if (!reward) {
      return c.json({ error: 'Reward not found' }, 404);
    }

    return c.json(reward);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/rewards/:id/redeem - Redeem a reward
rewardsRouter.post('/rewards/:id/redeem', async (c) => {
  try {
    const rewardId = c.req.param('id');
    const { walletAddress } = await c.req.json();

    if (!walletAddress) {
      return c.json({ error: 'walletAddress is required' }, 400);
    }

    const redemption = await redeemReward(walletAddress, rewardId);

    return c.json(redemption);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/redemptions - Get all redemptions (admin)
rewardsRouter.get('/redemptions', (c) => {
  const status = c.req.query('status') as any;
  const type = c.req.query('type') as any;
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100;

  const redemptions = getAllRedemptions({ status, type, limit });

  return c.json({
    total: redemptions.length,
    redemptions,
  });
});

// GET /api/redemptions/:id - Get specific redemption
rewardsRouter.get('/redemptions/:id', (c) => {
  const redemptionId = c.req.param('id');
  const redemption = getRedemptionById(redemptionId);

  if (!redemption) {
    return c.json({ error: 'Redemption not found' }, 404);
  }

  return c.json(redemption);
});

// GET /api/redemptions/user/:address - Get user's redemptions
rewardsRouter.get('/redemptions/user/:address', (c) => {
  const address = c.req.param('address');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;

  const redemptions = getUserRedemptions(address, limit);

  return c.json({
    total: redemptions.length,
    redemptions,
  });
});

// ⚠️ DEV ONLY: POST /api/redemptions/:id/process - Process a pending redemption (admin, no auth)
rewardsRouter.post('/redemptions/:id/process', async (c) => {
  try {
    const redemptionId = c.req.param('id');
    const redemption = await processRedemption(redemptionId);

    return c.json(redemption);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ⚠️ DEV ONLY: POST /api/redemptions/:id/cancel - Cancel a redemption (admin, no auth)
rewardsRouter.post('/redemptions/:id/cancel', async (c) => {
  try {
    const redemptionId = c.req.param('id');
    const redemption = await cancelRedemption(redemptionId);

    return c.json(redemption);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/reward-pool - Get reward pool status
rewardsRouter.get('/reward-pool', (c) => {
  const pool = getRewardPool();
  return c.json(pool);
});

// ⚠️ DEV ONLY: POST /api/reward-pool/add-budget - Add to reward pool budget (admin, no auth)
rewardsRouter.post('/reward-pool/add-budget', async (c) => {
  try {
    const { amount } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const pool = updateRewardPoolBudget(amount);
    return c.json(pool);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/reward-stats - Get reward statistics
rewardsRouter.get('/reward-stats', (c) => {
  const stats = getRewardStats();
  return c.json(stats);
});
