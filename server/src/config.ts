import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
};
