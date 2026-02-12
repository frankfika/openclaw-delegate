/**
 * Proposal Watcher — background service that polls Snapshot for new proposals
 * and pushes notifications through VoteNow's messaging channels (Telegram, etc.)
 *
 * Instead of running a custom grammy bot, this uses VoteNow's built-in
 * channel system to send notifications.
 */

import { fetchActiveProposals } from './snapshot.js';
import { analyzeProposal } from './llm.js';
import { syncAllProposals, getProposals } from './dao-manager.js';

let pollTimer: ReturnType<typeof setInterval> | null = null;
const knownProposalIds = new Set<string>();

export async function startProposalWatcher(
  intervalMinutes: number,
  api: any,
  addActivity: (a: any) => void,
) {
  // Initial load — sync all proposals from all DAOs
  try {
    const result = await syncAllProposals();
    console.log(`📋 Synced ${result.synced} proposals from all DAOs`);
    if (result.errors.length > 0) {
      console.warn('Some DAOs failed to sync:', result.errors);
    }

    // Seed known proposals
    const existing = getProposals({ state: 'active' });
    existing.forEach((p: any) => knownProposalIds.add(p.id));
  } catch (err) {
    console.warn('Initial proposal sync failed:', err);
  }

  // Poll for new proposals
  pollTimer = setInterval(async () => {
    try {
      const proposals = await fetchActiveProposals();
      const newProposals = proposals.filter((p: any) => !knownProposalIds.has(p.id));

      for (const p of newProposals) {
        knownProposalIds.add(p.id);

        addActivity({
          type: 'new_proposal',
          title: p.title,
          dao: p.space?.name,
        });

        // Quick AI analysis for the notification
        let riskHint = '';
        try {
          const analysis = await analyzeProposal(p.body || p.title);
          riskHint = `\n⚠️ Risk: ${analysis.riskLevel} | 🗳 Rec: ${analysis.recommendation}`;
        } catch {
          // Skip analysis in notification if it fails
        }

        const endDate = new Date(p.end * 1000).toLocaleDateString();
        const message =
          `🆕 <b>New Proposal Alert</b>\n\n` +
          `🏛 ${p.space.name}\n` +
          `📋 <b>${p.title}</b>\n` +
          `${p.body?.slice(0, 200) || ''}...\n` +
          `⏰ Ends: ${endDate}${riskHint}\n\n` +
          `Use /proposals to see all active proposals.`;

        // Push through VoteNow's channel system if available
        if (api.sendMessage) {
          try {
            await api.sendMessage({ text: message, parseMode: 'HTML' });
          } catch (err) {
            console.warn('Failed to push notification via VoteNow channel:', err);
          }
        }

        console.log(`🆕 New proposal detected: [${p.space.name}] ${p.title}`);
      }
    } catch (err) {
      console.warn('Proposal polling error:', err);
    }
  }, intervalMinutes * 60 * 1000);
}

export function stopProposalWatcher() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
