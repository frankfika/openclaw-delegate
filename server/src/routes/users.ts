/**
 * User Management API Routes
 */

import { Hono } from 'hono';
import {
  createUser,
  getUser,
  updateUser,
  connectWallet,
  disconnectWallet,
  getUserDashboard,
  getAllUsers,
  searchUsers,
  getUserStatistics,
  updateUserPreferences,
  generateReferralCode,
} from '../services/user.js';

export const usersRouter = new Hono();

// POST /api/users - Create or register user
usersRouter.post('/users', async (c) => {
  try {
    const { walletAddress, username, email, referredBy } = await c.req.json();

    if (!walletAddress) {
      return c.json({ error: 'walletAddress is required' }, 400);
    }

    // Check if user already exists
    const existing = getUser(walletAddress);
    if (existing) {
      return c.json({ user: existing, created: false });
    }

    // Create new user
    const user = createUser(walletAddress, {
      username,
      email,
      metadata: {
        referredBy,
        tier: 'free',
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      },
    });

    return c.json({ user, created: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/users/:identifier - Get user profile
usersRouter.get('/users/:identifier', (c) => {
  const identifier = c.req.param('identifier');
  const user = getUser(identifier);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

// PUT /api/users/:identifier - Update user profile
usersRouter.put('/users/:identifier', async (c) => {
  try {
    const identifier = c.req.param('identifier');
    const updates = await c.req.json();

    const user = updateUser(identifier, updates);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/users/:identifier/dashboard - Get user dashboard
usersRouter.get('/users/:identifier/dashboard', (c) => {
  try {
    const identifier = c.req.param('identifier');
    const dashboard = getUserDashboard(identifier);

    return c.json(dashboard);
  } catch (err: any) {
    if (err.message === 'User not found') {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/users/:identifier/wallets - Connect additional wallet
usersRouter.post('/users/:identifier/wallets', async (c) => {
  try {
    const identifier = c.req.param('identifier');
    const { walletAddress, signature } = await c.req.json();

    if (!walletAddress) {
      return c.json({ error: 'walletAddress is required' }, 400);
    }

    const user = connectWallet(identifier, walletAddress, signature);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/users/:identifier/wallets/:wallet - Disconnect wallet
usersRouter.delete('/users/:identifier/wallets/:wallet', (c) => {
  try {
    const identifier = c.req.param('identifier');
    const wallet = c.req.param('wallet');

    const user = disconnectWallet(identifier, wallet);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/users/:identifier/preferences - Update preferences
usersRouter.put('/users/:identifier/preferences', async (c) => {
  try {
    const identifier = c.req.param('identifier');
    const preferences = await c.req.json();

    const user = updateUserPreferences(identifier, preferences);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/users/:identifier/referral-code - Get or generate referral code
usersRouter.get('/users/:identifier/referral-code', (c) => {
  try {
    const identifier = c.req.param('identifier');
    const code = generateReferralCode(identifier);

    return c.json({ referralCode: code });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ⚠️ DEV ONLY: GET /api/users - Get all users (admin, no auth)
usersRouter.get('/users', (c) => {
  const tier = c.req.query('tier') as any;
  const minPoints = c.req.query('minPoints') ? parseInt(c.req.query('minPoints')!) : undefined;
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100;

  const users = getAllUsers({ tier, minPoints, limit });

  return c.json({
    total: users.length,
    users,
  });
});

// GET /api/users/search - Search users
usersRouter.get('/users/search', (c) => {
  const query = c.req.query('q');

  if (!query) {
    return c.json({ error: 'Query parameter q is required' }, 400);
  }

  const users = searchUsers(query);

  return c.json({
    total: users.length,
    users,
  });
});

// GET /api/user-stats - Get platform user statistics
usersRouter.get('/user-stats', (c) => {
  const stats = getUserStatistics();
  return c.json(stats);
});
