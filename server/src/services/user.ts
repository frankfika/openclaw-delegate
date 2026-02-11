/**
 * User and Wallet Management System
 *
 * Features:
 * - User profiles
 * - Multiple wallet binding
 * - Wallet verification
 * - User preferences
 * - Activity tracking
 */

import { getUserPoints, getUserStats } from './points.js';
import { getVoteRecords } from './dao-manager.js';
import { getUserRedemptions } from './rewards.js';

export interface UserProfile {
  id: string; // Primary wallet address (lowercase)
  primaryWallet: string;
  connectedWallets: string[]; // All wallets owned by this user
  username?: string;
  email?: string;
  avatar?: string;

  preferences: {
    notifications: {
      newProposals: boolean;
      votingReminders: boolean;
      rewardUpdates: boolean;
    };
    autoVote: {
      enabled: boolean;
      strategy?: 'ai-recommended' | 'follow-majority' | 'custom';
      riskTolerance?: 'low' | 'medium' | 'high';
    };
    privacy: {
      showOnLeaderboard: boolean;
      publicProfile: boolean;
    };
  };

  metadata: {
    referralCode?: string;
    referredBy?: string;
    tier?: 'free' | 'premium' | 'vip';
    joinedAt: string;
    lastSeenAt: string;
  };
}

export interface WalletVerification {
  walletAddress: string;
  userId: string;
  verified: boolean;
  verificationMethod: 'signature' | 'transaction' | 'manual';
  verifiedAt?: string;
  signature?: string;
}

// In-memory storage
const users = new Map<string, UserProfile>();
const walletVerifications = new Map<string, WalletVerification>();
const walletToUser = new Map<string, string>(); // wallet → userId mapping

/**
 * Create or get user profile
 */
export function createUser(walletAddress: string, data?: Partial<UserProfile>): UserProfile {
  const userId = walletAddress.toLowerCase();

  if (users.has(userId)) {
    return users.get(userId)!;
  }

  const now = new Date().toISOString();

  const newUser: UserProfile = {
    id: userId,
    primaryWallet: walletAddress,
    connectedWallets: [walletAddress],
    ...data,
    preferences: {
      notifications: {
        newProposals: true,
        votingReminders: true,
        rewardUpdates: true,
      },
      autoVote: {
        enabled: false,
      },
      privacy: {
        showOnLeaderboard: true,
        publicProfile: true,
      },
      ...data?.preferences,
    },
    metadata: {
      tier: 'free',
      joinedAt: now,
      lastSeenAt: now,
      ...data?.metadata,
    },
  };

  users.set(userId, newUser);
  walletToUser.set(walletAddress.toLowerCase(), userId);

  console.log(`👤 Created user profile for ${walletAddress}`);

  return newUser;
}

/**
 * Get user by ID or wallet address
 */
export function getUser(identifier: string): UserProfile | undefined {
  const id = identifier.toLowerCase();

  // Try as user ID first
  if (users.has(id)) {
    return users.get(id);
  }

  // Try as wallet address
  const userId = walletToUser.get(id);
  if (userId) {
    return users.get(userId);
  }

  return undefined;
}

/**
 * Update user profile
 */
export function updateUser(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'connectedWallets' | 'metadata'>>
): UserProfile | null {
  const user = getUser(userId);
  if (!user) return null;

  const updated: UserProfile = {
    ...user,
    ...updates,
    metadata: {
      ...user.metadata,
      lastSeenAt: new Date().toISOString(),
    },
  };

  users.set(user.id, updated);

  console.log(`📝 Updated user profile for ${userId}`);

  return updated;
}

/**
 * Connect additional wallet to user account
 */
export function connectWallet(
  userId: string,
  newWallet: string,
  verificationSignature?: string
): UserProfile | null {
  const user = getUser(userId);
  if (!user) return null;

  const walletLower = newWallet.toLowerCase();

  // Check if wallet already connected to another user
  const existingUserId = walletToUser.get(walletLower);
  if (existingUserId && existingUserId !== user.id) {
    throw new Error('Wallet already connected to another account');
  }

  // Check if already connected
  if (user.connectedWallets.includes(newWallet)) {
    return user;
  }

  // Add wallet
  user.connectedWallets.push(newWallet);
  walletToUser.set(walletLower, user.id);

  // Create verification record
  if (verificationSignature) {
    walletVerifications.set(walletLower, {
      walletAddress: newWallet,
      userId: user.id,
      verified: true,
      verificationMethod: 'signature',
      verifiedAt: new Date().toISOString(),
      signature: verificationSignature,
    });
  }

  users.set(user.id, user);

  console.log(`🔗 Connected wallet ${newWallet} to user ${userId}`);

  return user;
}

/**
 * Disconnect wallet from user account
 */
export function disconnectWallet(userId: string, wallet: string): UserProfile | null {
  const user = getUser(userId);
  if (!user) return null;

  const walletLower = wallet.toLowerCase();

  // Cannot disconnect primary wallet
  if (user.primaryWallet.toLowerCase() === walletLower) {
    throw new Error('Cannot disconnect primary wallet');
  }

  // Remove wallet
  user.connectedWallets = user.connectedWallets.filter(
    w => w.toLowerCase() !== walletLower
  );

  walletToUser.delete(walletLower);
  walletVerifications.delete(walletLower);

  users.set(user.id, user);

  console.log(`🔓 Disconnected wallet ${wallet} from user ${userId}`);

  return user;
}

/**
 * Get comprehensive user dashboard data
 */
export function getUserDashboard(userId: string) {
  const user = getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Aggregate data from all connected wallets
  let totalPoints = 0;
  let totalVotes = 0;
  const allVotes: any[] = [];
  const allRedemptions: any[] = [];

  for (const wallet of user.connectedWallets) {
    const points = getUserPoints(wallet);
    totalPoints += points.totalPoints;

    const votes = getVoteRecords({ voterAddress: wallet });
    totalVotes += votes.length;
    allVotes.push(...votes);

    const redemptions = getUserRedemptions(wallet);
    allRedemptions.push(...redemptions);
  }

  // Get stats for primary wallet
  const stats = getUserStats(user.primaryWallet);

  // Calculate additional metrics
  const uniqueDAOs = new Set(allVotes.map(v => v.daoId)).size;
  const recentVotes = allVotes
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    user,
    points: {
      total: totalPoints,
      available: stats.user.availablePoints,
      redeemed: stats.user.redeemedPoints,
      level: stats.level.current,
      nextLevel: stats.level.next,
      progress: stats.level.progress,
    },
    activity: {
      totalVotes,
      uniqueDAOs,
      currentStreak: stats.user.streak,
      recentVotes,
    },
    rewards: {
      total: allRedemptions.length,
      completed: allRedemptions.filter(r => r.status === 'completed').length,
      pending: allRedemptions.filter(r => r.status === 'pending').length,
      recent: allRedemptions.slice(0, 5),
    },
    wallets: user.connectedWallets.map(w => ({
      address: w,
      isPrimary: w === user.primaryWallet,
      verified: walletVerifications.get(w.toLowerCase())?.verified || false,
    })),
  };
}

/**
 * Get all users (for admin)
 */
export function getAllUsers(filters?: {
  tier?: 'free' | 'premium' | 'vip';
  minPoints?: number;
  limit?: number;
}): UserProfile[] {
  let result = Array.from(users.values());

  if (filters?.tier) {
    result = result.filter(u => u.metadata.tier === filters.tier);
  }

  if (filters?.minPoints !== undefined) {
    result = result.filter(u => {
      const points = getUserPoints(u.primaryWallet);
      return points.totalPoints >= filters.minPoints!;
    });
  }

  result.sort((a, b) => {
    const aPoints = getUserPoints(a.primaryWallet).totalPoints;
    const bPoints = getUserPoints(b.primaryWallet).totalPoints;
    return bPoints - aPoints;
  });

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Search users by username or wallet
 */
export function searchUsers(query: string): UserProfile[] {
  const lowerQuery = query.toLowerCase();

  return Array.from(users.values()).filter(user => {
    return (
      user.username?.toLowerCase().includes(lowerQuery) ||
      user.primaryWallet.toLowerCase().includes(lowerQuery) ||
      user.connectedWallets.some(w => w.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get user statistics (platform-wide)
 */
export function getUserStatistics() {
  const allUsers = Array.from(users.values());

  const byTier = {
    free: allUsers.filter(u => u.metadata.tier === 'free').length,
    premium: allUsers.filter(u => u.metadata.tier === 'premium').length,
    vip: allUsers.filter(u => u.metadata.tier === 'vip').length,
  };

  const totalWallets = Array.from(walletToUser.keys()).length;

  return {
    totalUsers: allUsers.length,
    totalWallets,
    byTier,
    activeToday: allUsers.filter(u => {
      const lastSeen = new Date(u.metadata.lastSeenAt);
      const today = new Date();
      return today.getTime() - lastSeen.getTime() < 86400000; // 24 hours
    }).length,
  };
}

/**
 * Update user preferences
 */
export function updateUserPreferences(
  userId: string,
  preferences: Partial<UserProfile['preferences']>
): UserProfile | null {
  const user = getUser(userId);
  if (!user) return null;

  user.preferences = {
    ...user.preferences,
    ...preferences,
    notifications: {
      ...user.preferences.notifications,
      ...preferences.notifications,
    },
    autoVote: {
      ...user.preferences.autoVote,
      ...preferences.autoVote,
    },
    privacy: {
      ...user.preferences.privacy,
      ...preferences.privacy,
    },
  };

  users.set(user.id, user);

  console.log(`⚙️ Updated preferences for user ${userId}`);

  return user;
}

/**
 * Generate referral code
 */
export function generateReferralCode(userId: string): string {
  const user = getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.metadata.referralCode) {
    return user.metadata.referralCode;
  }

  const code = `${user.username || 'USER'}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  user.metadata.referralCode = code;
  users.set(user.id, user);

  return code;
}
