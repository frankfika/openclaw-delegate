/**
 * Rewards Distribution System
 *
 * Manages platform rewards that users can redeem with their points:
 * - Token rewards (ERC20)
 * - NFT rewards (ERC721/1155)
 * - Vouchers and benefits
 * - Cash/stablecoin rewards
 *
 * Rewards are distributed from a managed pool and tracked for transparency
 */

import { redeemPoints } from './points.js';

// Reward types
export type RewardType = 'token' | 'nft' | 'voucher' | 'cash' | 'benefit';
export type RewardStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Reward catalog item
export interface RewardItem {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  stock: number; // -1 for unlimited
  imageUrl?: string;

  // Type-specific metadata
  metadata: {
    // Token rewards
    tokenAddress?: string;
    tokenAmount?: string;
    tokenSymbol?: string;
    chain?: string;

    // NFT rewards
    nftContract?: string;
    nftTokenId?: string;
    nftType?: 'erc721' | 'erc1155';

    // Voucher/benefit
    code?: string;
    expiryDate?: string;
    usageInstructions?: string;

    // Cash
    amount?: number;
    currency?: string;
  };

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reward redemption record
export interface RewardRedemption {
  id: string;
  userId: string;
  walletAddress: string;
  rewardId: string;
  rewardName: string;
  rewardType: RewardType;
  pointsSpent: number;
  status: RewardStatus;

  // Fulfillment details
  txHash?: string; // For on-chain rewards
  deliveryInfo?: any; // For off-chain rewards
  errorMessage?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Reward pool configuration
export interface RewardPool {
  totalPointsBudget: number; // Total points allocated for rewards
  pointsDistributed: number; // Points already distributed
  pointsRemaining: number; // Available budget

  tokenBalances: {
    [tokenSymbol: string]: {
      address: string;
      balance: string;
      chain: string;
    };
  };

  nftBalances: {
    [nftId: string]: {
      contract: string;
      tokenIds: string[];
      chain: string;
    };
  };
}

// In-memory storage
const rewardCatalog = new Map<string, RewardItem>();
const redemptions: RewardRedemption[] = [];
const rewardPool: RewardPool = {
  totalPointsBudget: 1000000, // 1M points budget
  pointsDistributed: 0,
  pointsRemaining: 1000000,
  tokenBalances: {},
  nftBalances: {},
};

/**
 * Initialize reward catalog with default items
 */
export function initializeRewards() {
  const defaultRewards: Omit<RewardItem, 'createdAt' | 'updatedAt'>[] = [
    // Token rewards
    {
      id: 'reward-usdc-10',
      name: '10 USDC',
      description: 'Receive 10 USDC directly to your wallet',
      type: 'token',
      pointsCost: 1000,
      stock: 100,
      imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      metadata: {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenAmount: '10000000', // 10 USDC (6 decimals)
        tokenSymbol: 'USDC',
        chain: 'ethereum',
      },
      isActive: true,
    },
    {
      id: 'reward-usdc-50',
      name: '50 USDC',
      description: 'Receive 50 USDC directly to your wallet',
      type: 'token',
      pointsCost: 4500,
      stock: 50,
      imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      metadata: {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenAmount: '50000000',
        tokenSymbol: 'USDC',
        chain: 'ethereum',
      },
      isActive: true,
    },
    {
      id: 'reward-arb-5',
      name: '5 ARB Tokens',
      description: 'Receive 5 ARB tokens on Arbitrum',
      type: 'token',
      pointsCost: 500,
      stock: 200,
      metadata: {
        tokenAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        tokenAmount: '5000000000000000000', // 5 ARB (18 decimals)
        tokenSymbol: 'ARB',
        chain: 'arbitrum',
      },
      isActive: true,
    },

    // NFT rewards
    {
      id: 'reward-nft-bronze',
      name: 'Bronze Governance Badge',
      description: 'Exclusive NFT badge for active governance participants',
      type: 'nft',
      pointsCost: 2000,
      stock: 500,
      metadata: {
        nftContract: '0x...', // ⚠️ TODO: Replace with actual NFT contract address
        nftType: 'erc721',
        chain: 'ethereum',
      },
      isActive: true,
    },
    {
      id: 'reward-nft-silver',
      name: 'Silver Governance Badge',
      description: 'Rare NFT badge for dedicated voters',
      type: 'nft',
      pointsCost: 5000,
      stock: 100,
      metadata: {
        nftContract: '0x...', // ⚠️ TODO: Replace with actual NFT contract address
        nftType: 'erc721',
        chain: 'ethereum',
      },
      isActive: true,
    },
    {
      id: 'reward-nft-gold',
      name: 'Gold Governance Badge',
      description: 'Ultra-rare NFT badge for governance legends',
      type: 'nft',
      pointsCost: 15000,
      stock: 20,
      metadata: {
        nftContract: '0x...', // ⚠️ TODO: Replace with actual NFT contract address
        nftType: 'erc721',
        chain: 'ethereum',
      },
      isActive: true,
    },

    // Voucher rewards
    {
      id: 'reward-voucher-gas',
      name: 'Gas Fee Voucher',
      description: 'Get reimbursed for 10 transactions worth of gas',
      type: 'voucher',
      pointsCost: 300,
      stock: -1, // Unlimited
      metadata: {
        amount: 10,
        currency: 'transactions',
        expiryDate: '2027-12-31',
        usageInstructions: 'Submit transaction hashes for reimbursement',
      },
      isActive: true,
    },
    {
      id: 'reward-voucher-premium',
      name: '1 Month Premium Membership',
      description: 'Unlock premium features including advanced analytics and priority support',
      type: 'benefit',
      pointsCost: 1500,
      stock: -1,
      metadata: {
        usageInstructions: 'Automatically applied to your account upon redemption',
      },
      isActive: true,
    },
    {
      id: 'reward-discount-20',
      name: '20% Platform Fee Discount',
      description: 'Get 20% discount on all platform fees for 3 months',
      type: 'benefit',
      pointsCost: 800,
      stock: -1,
      metadata: {
        expiryDate: '90 days from redemption',
        usageInstructions: 'Automatically applied to your transactions',
      },
      isActive: true,
    },
  ];

  for (const reward of defaultRewards) {
    const now = new Date().toISOString();
    rewardCatalog.set(reward.id, {
      ...reward,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`🎁 Initialized ${defaultRewards.length} reward items`);
}

/**
 * Get all reward items
 */
export function getAllRewards(filters?: {
  type?: RewardType;
  activeOnly?: boolean;
  maxPoints?: number;
}): RewardItem[] {
  let rewards = Array.from(rewardCatalog.values());

  if (filters?.type) {
    rewards = rewards.filter(r => r.type === filters.type);
  }

  if (filters?.activeOnly) {
    rewards = rewards.filter(r => r.isActive && (r.stock === -1 || r.stock > 0));
  }

  if (filters?.maxPoints) {
    const max = filters.maxPoints;
    rewards = rewards.filter(r => r.pointsCost <= max);
  }

  return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
}

/**
 * Get reward by ID
 */
export function getRewardById(rewardId: string): RewardItem | undefined {
  return rewardCatalog.get(rewardId);
}

/**
 * Add a new reward to catalog
 */
export function addReward(reward: Omit<RewardItem, 'createdAt' | 'updatedAt'>): RewardItem {
  const now = new Date().toISOString();
  const newReward: RewardItem = {
    ...reward,
    createdAt: now,
    updatedAt: now,
  };

  rewardCatalog.set(reward.id, newReward);
  console.log(`➕ Added reward: ${reward.name}`);
  return newReward;
}

/**
 * Update reward
 */
export function updateReward(
  rewardId: string,
  updates: Partial<Omit<RewardItem, 'id' | 'createdAt'>>
): RewardItem | null {
  const reward = rewardCatalog.get(rewardId);
  if (!reward) return null;

  const updated: RewardItem = {
    ...reward,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  rewardCatalog.set(rewardId, updated);
  return updated;
}

/**
 * Redeem a reward
 */
export async function redeemReward(
  walletAddress: string,
  rewardId: string
): Promise<RewardRedemption> {
  const reward = rewardCatalog.get(rewardId);

  if (!reward) {
    throw new Error('Reward not found');
  }

  if (!reward.isActive) {
    throw new Error('Reward is not active');
  }

  if (reward.stock === 0) {
    throw new Error('Reward is out of stock');
  }

  // Deduct points from user
  try {
    redeemPoints(walletAddress, reward.pointsCost, `Redeemed: ${reward.name}`);
  } catch (err: any) {
    throw new Error(`Failed to redeem points: ${err.message}`);
  }

  // Update stock
  if (reward.stock > 0) {
    reward.stock--;
    rewardCatalog.set(rewardId, reward);
  }

  // Update pool
  rewardPool.pointsDistributed += reward.pointsCost;
  rewardPool.pointsRemaining -= reward.pointsCost;

  // Create redemption record
  const redemption: RewardRedemption = {
    id: `redemption-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    userId: walletAddress.toLowerCase(),
    walletAddress,
    rewardId: reward.id,
    rewardName: reward.name,
    rewardType: reward.type,
    pointsSpent: reward.pointsCost,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  redemptions.unshift(redemption);

  console.log(`🎁 ${walletAddress} redeemed ${reward.name} for ${reward.pointsCost} points`);

  // Auto-process certain reward types
  if (reward.type === 'voucher' || reward.type === 'benefit') {
    await processRedemption(redemption.id);
  }

  return redemption;
}

/**
 * Process a redemption (fulfill the reward)
 */
export async function processRedemption(redemptionId: string): Promise<RewardRedemption> {
  const redemption = redemptions.find(r => r.id === redemptionId);
  if (!redemption) {
    throw new Error('Redemption not found');
  }

  if (redemption.status !== 'pending') {
    throw new Error(`Redemption is already ${redemption.status}`);
  }

  // Update status to processing
  redemption.status = 'processing';
  redemption.updatedAt = new Date().toISOString();

  const reward = rewardCatalog.get(redemption.rewardId);
  if (!reward) {
    redemption.status = 'failed';
    redemption.errorMessage = 'Reward not found';
    return redemption;
  }

  try {
    // Process based on reward type
    switch (reward.type) {
      case 'token':
        // ⚠️ MOCK: Implement actual token transfer in production
        redemption.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        redemption.status = 'completed';
        break;

      case 'nft':
        // ⚠️ MOCK: Implement actual NFT minting/transfer in production
        redemption.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        redemption.status = 'completed';
        break;

      case 'voucher':
      case 'benefit':
        // Generate voucher code or apply benefit
        redemption.deliveryInfo = {
          code: `VOUCHER-${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
          appliedAt: new Date().toISOString(),
        };
        redemption.status = 'completed';
        break;

      case 'cash':
        // TODO: Implement cash payout (e.g., via payment processor)
        redemption.status = 'completed';
        break;
    }

    redemption.completedAt = new Date().toISOString();
    redemption.updatedAt = new Date().toISOString();

    console.log(`✅ Processed redemption ${redemptionId}: ${redemption.status}`);
  } catch (err: any) {
    redemption.status = 'failed';
    redemption.errorMessage = err.message;
    redemption.updatedAt = new Date().toISOString();

    console.error(`❌ Failed to process redemption ${redemptionId}:`, err.message);
  }

  return redemption;
}

/**
 * Get user's redemption history
 */
export function getUserRedemptions(
  walletAddress: string,
  limit: number = 50
): RewardRedemption[] {
  const userId = walletAddress.toLowerCase();
  return redemptions
    .filter(r => r.userId === userId)
    .slice(0, limit);
}

/**
 * Get all redemptions (for admin)
 */
export function getAllRedemptions(filters?: {
  status?: RewardStatus;
  type?: RewardType;
  limit?: number;
}): RewardRedemption[] {
  let result = [...redemptions];

  if (filters?.status) {
    result = result.filter(r => r.status === filters.status);
  }

  if (filters?.type) {
    result = result.filter(r => r.rewardType === filters.type);
  }

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Get redemption by ID
 */
export function getRedemptionById(redemptionId: string): RewardRedemption | undefined {
  return redemptions.find(r => r.id === redemptionId);
}

/**
 * Cancel a redemption (refund points)
 */
export async function cancelRedemption(redemptionId: string): Promise<RewardRedemption> {
  const redemption = redemptions.find(r => r.id === redemptionId);
  if (!redemption) {
    throw new Error('Redemption not found');
  }

  if (redemption.status === 'completed') {
    throw new Error('Cannot cancel completed redemption');
  }

  if (redemption.status === 'cancelled') {
    throw new Error('Redemption already cancelled');
  }

  // Refund points
  const { awardBonusPoints } = await import('./points.js');
  awardBonusPoints(
    redemption.walletAddress,
    redemption.pointsSpent,
    `Refund: Cancelled redemption of ${redemption.rewardName}`
  );

  // Restore stock
  const reward = rewardCatalog.get(redemption.rewardId);
  if (reward && reward.stock > 0) {
    reward.stock++;
    rewardCatalog.set(redemption.rewardId, reward);
  }

  // Update pool
  rewardPool.pointsDistributed -= redemption.pointsSpent;
  rewardPool.pointsRemaining += redemption.pointsSpent;

  // Update redemption
  redemption.status = 'cancelled';
  redemption.updatedAt = new Date().toISOString();

  console.log(`❌ Cancelled redemption ${redemptionId}, refunded ${redemption.pointsSpent} points`);

  return redemption;
}

/**
 * Get reward pool status
 */
export function getRewardPool(): RewardPool {
  return { ...rewardPool };
}

/**
 * Update reward pool budget
 */
export function updateRewardPoolBudget(additionalPoints: number): RewardPool {
  rewardPool.totalPointsBudget += additionalPoints;
  rewardPool.pointsRemaining += additionalPoints;

  console.log(`💰 Reward pool budget increased by ${additionalPoints} points`);
  return { ...rewardPool };
}

/**
 * Get reward statistics
 */
export function getRewardStats() {
  const allRedemptions = redemptions;
  const completedRedemptions = redemptions.filter(r => r.status === 'completed');

  const rewardsByType = Array.from(rewardCatalog.values()).reduce((acc, reward) => {
    acc[reward.type] = (acc[reward.type] || 0) + 1;
    return acc;
  }, {} as Record<RewardType, number>);

  const redemptionsByType = completedRedemptions.reduce((acc, redemption) => {
    acc[redemption.rewardType] = (acc[redemption.rewardType] || 0) + 1;
    return acc;
  }, {} as Record<RewardType, number>);

  return {
    catalog: {
      total: rewardCatalog.size,
      byType: rewardsByType,
      active: Array.from(rewardCatalog.values()).filter(r => r.isActive).length,
    },
    redemptions: {
      total: allRedemptions.length,
      completed: completedRedemptions.length,
      pending: redemptions.filter(r => r.status === 'pending').length,
      failed: redemptions.filter(r => r.status === 'failed').length,
      byType: redemptionsByType,
    },
    pool: rewardPool,
    topRewards: getTopRewards(5),
  };
}

/**
 * Get most popular rewards
 */
function getTopRewards(limit: number) {
  const redemptionCounts = redemptions.reduce((acc, r) => {
    acc[r.rewardId] = (acc[r.rewardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(redemptionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([rewardId, count]) => ({
      reward: rewardCatalog.get(rewardId),
      redemptions: count,
    }));
}

// Initialize on module load
initializeRewards();
