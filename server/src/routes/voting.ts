/**
 * Real Voting API Routes
 */

import { Hono } from 'hono';
import {
  castVote,
  getSnapshotVotingPower,
  validatePrivateKey,
  getAddressFromPrivateKey,
} from '../services/voting.js';
import { awardVotePoints } from '../services/points.js';
import { recordVote, getProposalById } from '../services/dao-manager.js';

export const votingRouter = new Hono();

// ⚠️ DEV ONLY: POST /api/cast-vote - Cast a real vote
// In production, use wallet-signed transactions instead of passing privateKey in request body
votingRouter.post('/cast-vote', async (c) => {
  try {
    const {
      proposalId,
      daoSpace,
      governanceType,
      choice,
      reason,
      privateKey,
      governorAddress,
      rpcUrl,
    } = await c.req.json();

    // Validate inputs
    if (!proposalId || !daoSpace || !governanceType || choice === undefined || !privateKey) {
      return c.json(
        { error: 'Missing required fields: proposalId, daoSpace, governanceType, choice, privateKey' },
        400
      );
    }

    // Validate private key
    if (!validatePrivateKey(privateKey)) {
      return c.json({ error: 'Invalid private key' }, 400);
    }

    const walletAddress = getAddressFromPrivateKey(privateKey);

    // Cast the vote
    const result = await castVote({
      proposalId,
      daoSpace,
      governanceType,
      choice,
      reason,
      privateKey,
      governorAddress,
      rpcUrl,
    });

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    // Get proposal details
    const proposal = getProposalById(proposalId);

    if (proposal) {
      // Award points
      const now = Date.now() / 1000;
      const isEarlyVote = (now - proposal.startTime) < 86400;

      const pointsTx = awardVotePoints(walletAddress, proposalId, daoSpace, isEarlyVote);

      // Record vote
      const voteRecord = recordVote({
        proposalId,
        daoId: proposal.daoId,
        voterAddress: walletAddress,
        choice,
        votingPower: '1000', // TODO: Get actual voting power
        reason,
        txHash: result.txHash,
        pointsEarned: pointsTx.amount,
      });

      return c.json({
        success: true,
        vote: result,
        points: pointsTx,
        record: voteRecord,
      });
    } else {
      // Proposal not in our database, just return vote result
      return c.json({
        success: true,
        vote: result,
      });
    }
  } catch (err: any) {
    console.error('Cast vote error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

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

// POST /api/validate-wallet - Validate private key and return address
votingRouter.post('/validate-wallet', async (c) => {
  try {
    const { privateKey } = await c.req.json();

    if (!privateKey) {
      return c.json({ error: 'privateKey required' }, 400);
    }

    if (!validatePrivateKey(privateKey)) {
      return c.json({ valid: false, error: 'Invalid private key format' });
    }

    const address = getAddressFromPrivateKey(privateKey);

    return c.json({
      valid: true,
      address,
    });
  } catch (err: any) {
    return c.json({ valid: false, error: err.message });
  }
});
