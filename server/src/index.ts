/**
 * VoteNow — Standalone Entry Point
 *
 * This runs the DAO governance agent as a standalone server for development
 * and demo purposes. In production, the plugin is loaded by VoteNow via
 * the plugin config and `plugin.ts`.
 *
 * Standalone mode:
 *   - Starts the dashboard API server (Hono)
 *   - Starts the Telegram bot (grammy) for direct bot interactions
 *   - Starts the proposal watcher for push notifications
 *
 * Plugin mode (via VoteNow):
 *   - VoteNow loads plugin.ts → registers tools + services
 *   - Telegram handled by VoteNow's built-in channel
 *   - Dashboard runs as a plugin service
 */

import { config } from './config.js';
import { startDashboardServer } from './services/dashboard.js';
import { startProposalWatcher } from './services/watcher.js';
import { startTelegramBot } from './services/telegram.js';

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

console.log('🏛 VoteNow — Standalone Mode');
console.log(`🚀 Starting on port ${config.port}...`);

// Start dashboard API
startDashboardServer(config.port, { voteIntents, activityLog, addActivity });

// Start Telegram bot if configured
if (config.telegramBotToken) {
  startTelegramBot().catch(err => {
    console.warn('⚠️ Telegram bot failed to start:', err.message);
  });
} else {
  console.log('ℹ️ Telegram bot not configured (set TELEGRAM_BOT_TOKEN in .env)');
}

// Start proposal watcher with a mock API adapter for standalone mode
const standaloneApi = {
  sendMessage: async (msg: any) => {
    console.log('📢 Notification:', msg.text?.replace(/<[^>]+>/g, '').slice(0, 100));
  },
};
startProposalWatcher(5, standaloneApi, addActivity);
