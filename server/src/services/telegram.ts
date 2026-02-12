import { config } from '../config.js';
import { fetchActiveProposals } from './snapshot.js';
import { analyzeProposal } from './llm.js';

let bot: any = null;
let subscribedUsers: Map<string, { chatId: number; walletAddress?: string; daos: string[] }> = new Map();
let lastKnownProposalIds: Set<string> = new Set();

export async function startTelegramBot() {
  if (!config.telegramBotToken) {
    console.log('Telegram bot token not configured');
    return;
  }

  const { Bot, InlineKeyboard } = await import('grammy');
  bot = new Bot(config.telegramBotToken);

  // /start command
  bot.command('start', async (ctx: any) => {
    const userId = ctx.from?.id?.toString();
    if (!userId) return;

    subscribedUsers.set(userId, {
      chatId: ctx.chat.id,
      daos: ['aave.eth', 'uniswapgovernance.eth', 'lido-snapshot.eth'],
    });

    await ctx.reply(
      '🤖 *Welcome to VoteNow!*\n\n' +
      'I\'m your AI-powered DAO governance agent, built on VoteNow.\n' +
      'I monitor Snapshot proposals, analyze them with AI, and help you vote.\n\n' +
      'Commands:\n' +
      '/proposals - View active proposals\n' +
      '/settings - Configure tracked DAOs\n' +
      '/wallet <address> - Link your wallet\n\n' +
      'I\'ll notify you when new proposals appear!',
      { parse_mode: 'Markdown' }
    );
  });

  // /proposals command
  bot.command('proposals', async (ctx: any) => {
    try {
      const proposals = await fetchActiveProposals();

      if (proposals.length === 0) {
        await ctx.reply('No active proposals found across tracked DAOs.');
        return;
      }

      for (const p of proposals.slice(0, 5)) {
        const endDate = new Date(p.end * 1000).toLocaleDateString();
        const totalVotes = p.scores_total || 0;

        const keyboard = new InlineKeyboard()
          .text('✅ Vote For', `vote_for_${p.id}`)
          .text('❌ Vote Against', `vote_against_${p.id}`)
          .row()
          .text('🔍 Details', `detail_${p.id}`);

        await ctx.reply(
          `📋 *${p.space.name}*\n\n` +
          `*${p.title}*\n\n` +
          `📊 Votes: ${p.votes} | Total Score: ${totalVotes.toFixed(0)}\n` +
          `⏰ Ends: ${endDate}\n` +
          `🏷 Status: ${p.state}`,
          {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
          }
        );
      }
    } catch (err: any) {
      await ctx.reply('❌ Error fetching proposals: ' + err.message);
    }
  });

  // /settings command
  bot.command('settings', async (ctx: any) => {
    const userId = ctx.from?.id?.toString();
    if (!userId) return;

    const user = subscribedUsers.get(userId);
    const daos = user?.daos?.join(', ') || 'aave.eth, uniswapgovernance.eth, lido-snapshot.eth';

    await ctx.reply(
      '⚙️ *VoteNow Settings*\n\n' +
      `Tracked DAOs: ${daos}\n\n` +
      'To update, reply with DAO space IDs separated by commas.\n' +
      'Example: `aave.eth, ens.eth, safe.eth`',
      { parse_mode: 'Markdown' }
    );
  });

  // /wallet command
  bot.command('wallet', async (ctx: any) => {
    const userId = ctx.from?.id?.toString();
    if (!userId) return;

    const address = ctx.match?.trim();
    if (!address || !address.startsWith('0x')) {
      await ctx.reply('Please provide a valid wallet address: /wallet 0x...');
      return;
    }

    const user = subscribedUsers.get(userId) || { chatId: ctx.chat.id, daos: [] as string[], walletAddress: undefined as string | undefined };
    user.walletAddress = address;
    subscribedUsers.set(userId, user);

    await ctx.reply(`✅ Wallet linked: \`${address.slice(0, 6)}...${address.slice(-4)}\``, {
      parse_mode: 'Markdown',
    });
  });

  // Inline button callbacks
  bot.callbackQuery(/^vote_(for|against)_(.+)$/, async (ctx: any) => {
    const match = ctx.callbackQuery.data.match(/^vote_(for|against)_(.+)$/);
    if (!match) return;

    const direction = match[1];
    const proposalId = match[2];

    await ctx.answerCallbackQuery({
      text: `Vote ${direction === 'for' ? '✅ For' : '❌ Against'} recorded! Open VoteNow web app to sign with MetaMask.`,
      show_alert: true,
    });

    await ctx.reply(
      `🗳 *Vote Intent Recorded*\n\n` +
      `Direction: ${direction === 'for' ? '✅ For' : '❌ Against'}\n` +
      `Proposal: \`${proposalId.slice(0, 10)}...\`\n\n` +
      `Open the VoteNow web app to complete the vote with your wallet signature.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery(/^detail_(.+)$/, async (ctx: any) => {
    const proposalId = ctx.callbackQuery.data.replace('detail_', '');

    await ctx.answerCallbackQuery({ text: 'Analyzing proposal...' });

    try {
      // Fetch and analyze proposal
      const proposals = await fetchActiveProposals();
      const proposal = proposals.find(p => p.id === proposalId);

      if (!proposal) {
        await ctx.reply('Proposal not found.');
        return;
      }

      const analysis = await analyzeProposal(proposal.body || proposal.title);

      await ctx.reply(
        `🔍 *AI Analysis: ${proposal.title}*\n\n` +
        `📝 ${analysis.summary}\n\n` +
        `⚠️ Risk: ${analysis.riskLevel}\n` +
        `📊 Strategy Match: ${analysis.strategyMatchScore}%\n` +
        `🗳 Recommendation: ${analysis.recommendation}\n\n` +
        `Key Points:\n${(analysis.keyPoints || []).map((p: string) => `• ${p}`).join('\n')}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err: any) {
      await ctx.reply('❌ Error analyzing proposal: ' + err.message);
    }
  });

  // Start polling
  bot.start();
  console.log('🤖 Telegram bot started');

  // Start proposal polling for push notifications
  startProposalPolling();
}

async function startProposalPolling() {
  // Initial load
  try {
    const proposals = await fetchActiveProposals();
    proposals.forEach(p => lastKnownProposalIds.add(p.id));
    console.log(`📋 Loaded ${proposals.length} existing proposals`);
  } catch (err) {
    console.warn('Initial proposal fetch failed:', err);
  }

  // Poll every 5 minutes
  setInterval(async () => {
    try {
      const proposals = await fetchActiveProposals();
      const newProposals = proposals.filter(p => !lastKnownProposalIds.has(p.id));

      if (newProposals.length > 0 && bot) {
        for (const p of newProposals) {
          lastKnownProposalIds.add(p.id);

          // Push to all subscribers
          const { InlineKeyboard } = await import('grammy');
          for (const [, user] of subscribedUsers) {
            try {
              const keyboard = new InlineKeyboard()
                .text('✅ Vote For', `vote_for_${p.id}`)
                .text('❌ Vote Against', `vote_against_${p.id}`)
                .row()
                .text('🔍 AI Analysis', `detail_${p.id}`);

              await bot.api.sendMessage(
                user.chatId,
                `🆕 *New Proposal Alert!*\n\n` +
                `🏛 ${p.space.name}\n` +
                `📋 *${p.title}*\n\n` +
                `${p.body?.slice(0, 200) || ''}...\n\n` +
                `⏰ Ends: ${new Date(p.end * 1000).toLocaleDateString()}`,
                {
                  parse_mode: 'Markdown',
                  reply_markup: keyboard,
                }
              );
            } catch (err) {
              console.warn('Failed to push to user:', err);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Proposal polling error:', err);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export function getTelegramBot() {
  return bot;
}
