/**
 * Voting API Routes
 *
 * Vote signing is handled client-side via MetaMask EIP-712.
 * These routes provide voting power queries and address validation.
 */

import { Hono } from 'hono';
import {
  getSnapshotVotingPower,
  validateAddress,
} from '../services/voting.js';

export const votingRouter = new Hono();

// POST /api/check-voting-power - Check voting power for a wallet
votingRouter.post('/check-voting-power', async (c) => {
  try {
    const { space, address, proposalId } = await c.req.json();

    if (!space || !address) {
      return c.json({ error: 'space and address required' }, 400);
    }

    const power = await getSnapshotVotingPower(space, address, proposalId);

    return c.json(power);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/validate-wallet - Validate wallet address format
votingRouter.post('/validate-wallet', async (c) => {
  try {
    const { address } = await c.req.json();

    if (!address) {
      return c.json({ error: 'address required' }, 400);
    }

    return c.json({
      valid: validateAddress(address),
      address,
    });
  } catch (err: any) {
    return c.json({ valid: false, error: err.message });
  }
});
