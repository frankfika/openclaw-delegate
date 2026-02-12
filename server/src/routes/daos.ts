/**
 * DAO Management API Routes
 */

import { Hono } from 'hono';
import {
  getAllDAOs,
  getActiveDAOs,
  getDAOById,
  getDAOsByChain,
  getDAOsByTier,
  getProposals,
  getProposalById,
  getVoteRecords,
  getDAOStats,
  getAllDAOStats,
  getPlatformStats,
  syncAllProposals,
} from '../services/dao-manager.js';

export const daosRouter = new Hono();

// GET /api/daos - Get all DAOs
daosRouter.get('/daos', (c) => {
  const activeOnly = c.req.query('active') === 'true';
  const chain = c.req.query('chain');
  const tier = c.req.query('tier');

  let daos = activeOnly ? getActiveDAOs() : getAllDAOs();

  if (chain) {
    daos = getDAOsByChain(chain);
  }

  if (tier) {
    daos = getDAOsByTier(parseInt(tier));
  }

  return c.json({
    total: daos.length,
    daos,
  });
});

// GET /api/daos/:id - Get specific DAO
daosRouter.get('/daos/:id', (c) => {
  const daoId = c.req.param('id');
  const dao = getDAOById(daoId);

  if (!dao) {
    return c.json({ error: 'DAO not found' }, 404);
  }

  const stats = getDAOStats(daoId);
  const proposals = getProposals({ daoId, limit: 10 });

  return c.json({
    dao,
    stats,
    recentProposals: proposals,
  });
});

// GET /api/daos/:id/proposals - Get all proposals for a DAO
daosRouter.get('/daos/:id/proposals', (c) => {
  const daoId = c.req.param('id');
  const state = c.req.query('state');
  const limit = parseInt(c.req.query('limit') || '20');

  const proposals = getProposals({ daoId, state, limit });

  return c.json({
    total: proposals.length,
    proposals,
  });
});

// GET /api/daos/:id/stats - Get DAO statistics
daosRouter.get('/daos/:id/stats', (c) => {
  const daoId = c.req.param('id');
  const stats = getDAOStats(daoId);

  if (!stats) {
    return c.json({ error: 'Stats not found' }, 404);
  }

  return c.json(stats);
});

// GET /api/daos/stats/all - Get all DAO statistics
daosRouter.get('/daos/stats/all', (c) => {
  const stats = getAllDAOStats();
  return c.json({
    total: stats.length,
    stats,
  });
});

// GET /api/proposals - Get all proposals (with filters)
daosRouter.get('/proposals', (c) => {
  const daoId = c.req.query('daoId');
  const state = c.req.query('state');
  const limit = parseInt(c.req.query('limit') || '50');

  const proposals = getProposals({ daoId, state, limit });

  // Add fullContent field for frontend compatibility
  const proposalsWithFullContent = proposals.map(p => ({
    ...p,
    fullContent: p.description,
  }));

  return c.json({
    total: proposalsWithFullContent.length,
    proposals: proposalsWithFullContent,
  });
});

// GET /api/proposals/:id - Get specific proposal
daosRouter.get('/proposals/:id', (c) => {
  const proposalId = c.req.param('id');
  const proposal = getProposalById(proposalId);

  if (!proposal) {
    return c.json({ error: 'Proposal not found' }, 404);
  }

  const votes = getVoteRecords({ proposalId });

  // Add fullContent field for frontend compatibility
  const proposalWithFullContent = {
    ...proposal,
    fullContent: proposal.description,
  };

  return c.json({
    proposal: proposalWithFullContent,
    votes,
  });
});

// GET /api/votes - Get vote records (with filters)
daosRouter.get('/votes', (c) => {
  const voterAddress = c.req.query('voter');
  const daoId = c.req.query('daoId');
  const proposalId = c.req.query('proposalId');
  const limit = parseInt(c.req.query('limit') || '50');

  const votes = getVoteRecords({ voterAddress, daoId, proposalId, limit });

  return c.json({
    total: votes.length,
    votes,
  });
});

// GET /api/platform-stats - Get platform-wide statistics
daosRouter.get('/platform-stats', (c) => {
  const stats = getPlatformStats();
  return c.json(stats);
});

// POST /api/sync-proposals - Manually trigger proposal sync
daosRouter.post('/sync-proposals', async (c) => {
  try {
    const result = await syncAllProposals();
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
