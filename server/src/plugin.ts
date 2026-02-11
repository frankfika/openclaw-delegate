/**
 * OpenClaw Delegate — Plugin Entry Point
 *
 * Registers agent tools and background services with the OpenClaw framework.
 * This is the core integration layer that turns the DAO governance logic
 * into an OpenClaw plugin.
 */

import { fetchActiveProposals, fetchProposalById, fetchRecentProposals } from './services/snapshot.js';
import { analyzeProposal, chatWithAgent } from './services/llm.js';
import { startDashboardServer } from './services/dashboard.js';
import { startProposalWatcher } from './services/watcher.js';

// In-memory state
const voteIntents: any[] = [];
const activityLog: any[] = [];

function addActivity(activity: any) {
  activityLog.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...activity,
  });
  if (activityLog.length > 100) activityLog.pop();
}

export default function register(api: any) {
  const config = api.getConfig?.() || {};

  // ─── Tool: snapshot_proposals ───────────────────────────────────
  api.registerTool({
    name: 'snapshot_proposals',
    description:
      'Fetch active DAO governance proposals from Snapshot. ' +
      'Use action "list" to get all active proposals (optionally filter by dao). ' +
      'Use action "get" with proposalId to fetch a specific proposal. ' +
      'Use action "recent" to get recently closed proposals.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'get', 'recent'],
          description: 'Action to perform',
        },
        dao: {
          type: 'string',
          description: 'Snapshot space ID to filter (e.g. "aave.eth"). Only for action "list".',
        },
        proposalId: {
          type: 'string',
          description: 'Proposal ID. Required for action "get".',
        },
      },
      required: ['action'],
    },
    async execute(_id: string, params: any) {
      try {
        if (params.action === 'get') {
          if (!params.proposalId) {
            return { content: [{ type: 'text', text: 'Error: proposalId is required for action "get"' }] };
          }
          const proposal = await fetchProposalById(params.proposalId);
          if (!proposal) {
            return { content: [{ type: 'text', text: 'Proposal not found.' }] };
          }
          addActivity({ type: 'proposal_viewed', proposal: proposal.title, dao: proposal.space?.name });
          return { content: [{ type: 'text', text: JSON.stringify(proposal, null, 2) }] };
        }

        if (params.action === 'recent') {
          const proposals = await fetchRecentProposals();
          return {
            content: [{
              type: 'text',
              text: `Found ${proposals.length} recent proposals:\n\n` +
                proposals.map((p: any) =>
                  `• [${p.space.name}] ${p.title} — ${p.state} (${p.votes} votes)`
                ).join('\n'),
            }],
          };
        }

        // Default: list active
        const proposals = await fetchActiveProposals(params.dao);
        addActivity({ type: 'proposals_fetched', count: proposals.length, dao: params.dao || 'all' });

        if (proposals.length === 0) {
          return { content: [{ type: 'text', text: 'No active proposals found across tracked DAOs.' }] };
        }

        const summary = proposals.map((p: any) => {
          const endDate = new Date(p.end * 1000).toLocaleDateString();
          return `🏛 **${p.space.name}**\n` +
            `📋 ${p.title}\n` +
            `📊 Votes: ${p.votes} | Score: ${(p.scores_total || 0).toFixed(0)}\n` +
            `⏰ Ends: ${endDate} | State: ${p.state}\n` +
            `🔗 ID: ${p.id.slice(0, 16)}...`;
        }).join('\n\n---\n\n');

        return {
          content: [{
            type: 'text',
            text: `Found ${proposals.length} active proposals:\n\n${summary}`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error fetching proposals: ${err.message}` }] };
      }
    },
  });

  // ─── Tool: analyze_proposal ─────────────────────────────────────
  api.registerTool({
    name: 'analyze_proposal',
    description:
      'Analyze a DAO governance proposal using AI. Returns structured analysis ' +
      'including risk level, strategy alignment score, vote recommendation, ' +
      'key points, and security checks.',
    parameters: {
      type: 'object',
      properties: {
        proposalText: {
          type: 'string',
          description: 'The full proposal body text to analyze',
        },
        strategy: {
          type: 'string',
          enum: ['conservative', 'balanced', 'aggressive'],
          description: 'User voting strategy for alignment scoring',
        },
      },
      required: ['proposalText'],
    },
    async execute(_id: string, params: any) {
      try {
        const result = await analyzeProposal(params.proposalText);
        addActivity({
          type: 'proposal_analyzed',
          risk: result.riskLevel,
          recommendation: result.recommendation,
        });

        const output = [
          `📝 **Summary**: ${result.summary}`,
          `⚠️ **Risk Level**: ${result.riskLevel}`,
          `📊 **Strategy Match**: ${result.strategyMatchScore}%`,
          `🗳 **Recommendation**: ${result.recommendation}`,
          '',
          '**Key Points**:',
          ...(result.keyPoints || []).map((p: string) => `• ${p}`),
          '',
          '**Security Checks**:',
          ...(result.securityChecks || []).map((c: any) =>
            `${c.status === 'pass' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'} ${c.name}: ${c.details}`
          ),
        ].join('\n');

        return { content: [{ type: 'text', text: output }] };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Error analyzing proposal: ${err.message}` }] };
      }
    },
  });

  // ─── Tool: cast_vote ────────────────────────────────────────────
  api.registerTool({
    name: 'cast_vote',
    description:
      'Record a vote intent for a DAO proposal. This does NOT execute the vote — ' +
      'the user must confirm and sign with their wallet via the web dashboard or Telegram. ' +
      'This implements the Human-in-the-loop security model.',
    parameters: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'The Snapshot proposal ID',
        },
        direction: {
          type: 'string',
          enum: ['for', 'against', 'abstain'],
          description: 'Vote direction',
        },
        reason: {
          type: 'string',
          description: 'Reason for the vote recommendation',
        },
      },
      required: ['proposalId', 'direction'],
    },
    async execute(_id: string, params: any) {
      const intent = {
        id: `vote-${Date.now()}`,
        proposalId: params.proposalId,
        direction: params.direction,
        reason: params.reason || '',
        timestamp: new Date().toISOString(),
        status: 'pending_confirmation',
      };

      voteIntents.unshift(intent);
      addActivity({
        type: 'vote_intent',
        proposalId: params.proposalId,
        direction: params.direction,
      });

      const emoji = params.direction === 'for' ? '✅' : params.direction === 'against' ? '❌' : '⏸';

      return {
        content: [{
          type: 'text',
          text: `${emoji} **Vote Intent Recorded**\n\n` +
            `Proposal: \`${params.proposalId.slice(0, 16)}...\`\n` +
            `Direction: ${params.direction.toUpperCase()}\n` +
            `${params.reason ? `Reason: ${params.reason}\n` : ''}` +
            `Status: ⏳ Pending user confirmation\n\n` +
            `⚠️ **Human-in-the-loop**: The user must confirm this vote by signing with their wallet ` +
            `via the OpenClaw web dashboard (http://localhost:${config.dashboardPort || 3001}) ` +
            `or by clicking the confirmation button in Telegram.`,
        }],
      };
    },
  });

  // ─── Service: Dashboard API Server ──────────────────────────────
  api.registerService({
    id: 'delegate-dashboard',
    async start() {
      const port = config.dashboardPort || 3001;
      await startDashboardServer(port, { voteIntents, activityLog, addActivity });
      console.log(`🏛 OpenClaw Delegate dashboard running at http://localhost:${port}`);
    },
    async stop() {
      console.log('🏛 OpenClaw Delegate dashboard stopped');
    },
  });

  // ─── Service: Proposal Watcher ──────────────────────────────────
  api.registerService({
    id: 'proposal-watcher',
    async start() {
      const intervalMin = config.pollIntervalMinutes || 5;
      await startProposalWatcher(intervalMin, api, addActivity);
      console.log(`👁 Proposal watcher started (every ${intervalMin} min)`);
    },
    async stop() {
      console.log('👁 Proposal watcher stopped');
    },
  });

  // ─── Auto-reply Command: /proposals ─────────────────────────────
  api.registerCommand?.({
    name: 'proposals',
    description: 'List active DAO governance proposals',
    async handler(ctx: any) {
      try {
        const proposals = await fetchActiveProposals();
        if (proposals.length === 0) {
          return 'No active proposals found across tracked DAOs.';
        }
        return proposals.slice(0, 5).map((p: any) => {
          const endDate = new Date(p.end * 1000).toLocaleDateString();
          return `🏛 ${p.space.name}\n📋 ${p.title}\n📊 ${p.votes} votes | Ends: ${endDate}`;
        }).join('\n\n---\n\n');
      } catch (err: any) {
        return `Error: ${err.message}`;
      }
    },
  });

  console.log('🏛 OpenClaw Delegate plugin registered');
}
