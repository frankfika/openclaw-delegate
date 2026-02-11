import { Hono } from 'hono';
import { fetchActiveProposals, fetchProposalById } from '../services/snapshot.js';

export const proposalsRouter = new Hono();

// GET /api/proposals - list active proposals
proposalsRouter.get('/proposals', async (c) => {
  try {
    const dao = c.req.query('dao');
    const proposals = await fetchActiveProposals(dao);
    return c.json(proposals);
  } catch (err: any) {
    console.error('Proposals fetch error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/proposals/:id - get single proposal
proposalsRouter.get('/proposals/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const proposal = await fetchProposalById(id);
    if (!proposal) {
      return c.json({ error: 'Proposal not found' }, 404);
    }
    return c.json(proposal);
  } catch (err: any) {
    console.error('Proposal fetch error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});
