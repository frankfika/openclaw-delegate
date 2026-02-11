/**
 * Points System - User governance participation rewards
 *
 * Users earn points by:
 * - Voting on proposals (varies by DAO tier)
 * - Early participation (bonus for voting early)
 * - Consistent activity (streak bonuses)
 *
 * Points can be redeemed for platform rewards
 */

import { getPointsForDAO, getDAOTier } from './snapshot.js';

// User point balance and history
interface UserPoints {
  userId: string;
  walletAddress: string;
  totalPoints: number;
  availablePoints: number; // Points not yet redeemed
  redeemedPoints: number;
  level: number; // User level based on total points
  streak: number; // Consecutive days with votes
  lastActivityDate: string;
  createdAt: string;
}

interface PointTransaction {
  id: string;
  userId: string;
  walletAddress: string;
  type: 'earn' | 'redeem' | 'bonus';
  amount: number;
  reason: string;
  metadata: {
    proposalId?: string;
    daoSpace?: string;
    daoTier?: number;
    earlyVoteBonus?: boolean;
    streakBonus?: number;
  };
  timestamp: string;
}

// In-memory storage (replace with database in production)
const userPointsMap = new Map<string, UserPoints>();
const pointTransactions: PointTransaction[] = [];

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, name: 'Newcomer' },
  { level: 2, minPoints: 500, name: 'Participant' },
  { level: 3, minPoints: 2000, name: 'Active Member' },
  { level: 4, minPoints: 5000, name: 'Power Voter' },
  { level: 5, minPoints: 10000, name: 'Governance Expert' },
  { level: 6, minPoints: 25000, name: 'DAO Legend' },
];

/**
 * Initialize or get user points record
 */
export function initializeUser(walletAddress: string): UserPoints {
  const userId = walletAddress.toLowerCase();

  if (!userPointsMap.has(userId)) {
    const newUser: UserPoints = {
      userId,
      walletAddress,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      level: 1,
      streak: 0,
      lastActivityDate: '',
      createdAt: new Date().toISOString(),
    };
    userPointsMap.set(userId, newUser);
  }

  return userPointsMap.get(userId)!;
}

/**
 * Award points for voting on a proposal
 */
export function awardVotePoints(
  walletAddress: string,
  proposalId: string,
  daoSpace: string,
  isEarlyVote: boolean = false
): PointTransaction {
  const user = initializeUser(walletAddress);
  const basePoints = getPointsForDAO(daoSpace);
  const daoTier = getDAOTier(daoSpace);

  // Calculate bonuses
  let totalPoints = basePoints;
  let earlyVoteBonus = false;
  let streakBonus = 0;

  // Early vote bonus (20% extra)
  if (isEarlyVote) {
    totalPoints += Math.floor(basePoints * 0.2);
    earlyVoteBonus = true;
  }

  // Streak bonus (update streak and award bonus)
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = user.lastActivityDate.split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastActivity === yesterday) {
    user.streak += 1;
  } else if (lastActivity !== today) {
    user.streak = 1;
  }

  // Streak bonus: 5% per day, max 50%
  if (user.streak > 1) {
    streakBonus = Math.min(user.streak - 1, 10) * 5; // Max 50% bonus
    totalPoints += Math.floor(basePoints * streakBonus / 100);
  }

  // Update user points
  user.totalPoints += totalPoints;
  user.availablePoints += totalPoints;
  user.lastActivityDate = new Date().toISOString();
  user.level = calculateLevel(user.totalPoints);

  // Record transaction
  const transaction: PointTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    userId: user.userId,
    walletAddress,
    type: 'earn',
    amount: totalPoints,
    reason: `Voted on ${daoSpace} proposal`,
    metadata: {
      proposalId,
      daoSpace,
      daoTier: daoTier.tier,
      earlyVoteBonus,
      streakBonus: streakBonus > 0 ? streakBonus : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  pointTransactions.unshift(transaction);

  console.log(`💎 Awarded ${totalPoints} points to ${walletAddress} (Base: ${basePoints}, Early: ${earlyVoteBonus}, Streak: ${streakBonus}%)`);

  return transaction;
}

/**
 * Redeem points for rewards
 */
export function redeemPoints(
  walletAddress: string,
  amount: number,
  reason: string
): PointTransaction | null {
  const user = initializeUser(walletAddress);

  if (user.availablePoints < amount) {
    throw new Error(`Insufficient points. Available: ${user.availablePoints}, Required: ${amount}`);
  }

  user.availablePoints -= amount;
  user.redeemedPoints += amount;

  const transaction: PointTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    userId: user.userId,
    walletAddress,
    type: 'redeem',
    amount: -amount,
    reason,
    metadata: {},
    timestamp: new Date().toISOString(),
  };

  pointTransactions.unshift(transaction);

  console.log(`🎁 Redeemed ${amount} points for ${walletAddress}: ${reason}`);

  return transaction;
}

/**
 * Award bonus points (e.g., referrals, special events)
 */
export function awardBonusPoints(
  walletAddress: string,
  amount: number,
  reason: string
): PointTransaction {
  const user = initializeUser(walletAddress);

  user.totalPoints += amount;
  user.availablePoints += amount;
  user.level = calculateLevel(user.totalPoints);

  const transaction: PointTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    userId: user.userId,
    walletAddress,
    type: 'bonus',
    amount,
    reason,
    metadata: {},
    timestamp: new Date().toISOString(),
  };

  pointTransactions.unshift(transaction);

  console.log(`✨ Bonus ${amount} points to ${walletAddress}: ${reason}`);

  return transaction;
}

/**
 * Get user points summary
 */
export function getUserPoints(walletAddress: string): UserPoints {
  return initializeUser(walletAddress);
}

/**
 * Get user transaction history
 */
export function getUserTransactions(
  walletAddress: string,
  limit: number = 50
): PointTransaction[] {
  const userId = walletAddress.toLowerCase();
  return pointTransactions
    .filter(tx => tx.userId === userId)
    .slice(0, limit);
}

/**
 * Get leaderboard (top users by total points)
 */
export function getLeaderboard(limit: number = 100): UserPoints[] {
  return Array.from(userPointsMap.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/**
 * Get user statistics
 */
export function getUserStats(walletAddress: string) {
  const user = getUserPoints(walletAddress);
  const transactions = getUserTransactions(walletAddress);

  const voteCount = transactions.filter(tx => tx.type === 'earn' && tx.metadata.proposalId).length;
  const daoSpaces = new Set(
    transactions
      .filter(tx => tx.metadata.daoSpace)
      .map(tx => tx.metadata.daoSpace)
  );

  const currentLevel = LEVEL_THRESHOLDS.find(l => l.level === user.level);
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === user.level + 1);

  return {
    user,
    stats: {
      totalVotes: voteCount,
      uniqueDAOs: daoSpaces.size,
      currentStreak: user.streak,
      averagePointsPerVote: voteCount > 0 ? Math.floor(user.totalPoints / voteCount) : 0,
    },
    level: {
      current: currentLevel,
      next: nextLevel,
      progress: nextLevel
        ? Math.floor((user.totalPoints - currentLevel!.minPoints) / (nextLevel.minPoints - currentLevel!.minPoints) * 100)
        : 100,
    },
  };
}

/**
 * Calculate user level based on total points
 */
function calculateLevel(totalPoints: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i].minPoints) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Get all point transactions (for admin)
 */
export function getAllTransactions(limit: number = 200): PointTransaction[] {
  return pointTransactions.slice(0, limit);
}

/**
 * Get platform statistics
 */
export function getPlatformStats() {
  const allUsers = Array.from(userPointsMap.values());
  const allTx = pointTransactions;

  const totalUsers = allUsers.length;
  const totalPointsDistributed = allUsers.reduce((sum, u) => sum + u.totalPoints, 0);
  const totalPointsRedeemed = allUsers.reduce((sum, u) => sum + u.redeemedPoints, 0);
  const totalVotes = allTx.filter(tx => tx.type === 'earn' && tx.metadata.proposalId).length;

  return {
    users: {
      total: totalUsers,
      byLevel: LEVEL_THRESHOLDS.map(level => ({
        level: level.level,
        name: level.name,
        count: allUsers.filter(u => u.level === level.level).length,
      })),
    },
    points: {
      distributed: totalPointsDistributed,
      redeemed: totalPointsRedeemed,
      available: totalPointsDistributed - totalPointsRedeemed,
    },
    activity: {
      totalVotes,
      averagePointsPerVote: totalVotes > 0 ? Math.floor(totalPointsDistributed / totalVotes) : 0,
    },
  };
}
