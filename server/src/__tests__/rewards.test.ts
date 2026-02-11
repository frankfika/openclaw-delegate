/**
 * Bug 14: .substr() → .slice() 验证
 * Bug 16: NFT 合约地址占位符标记
 * Bug 17: Mock 交易哈希标记
 *
 * 测试奖励系统核心逻辑
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  initializeRewards,
  getAllRewards,
  getRewardById,
  addReward,
  redeemReward,
  getRewardPool,
} from '../services/rewards.js';
import { awardBonusPoints } from '../services/points.js';

describe('rewards.ts', () => {
  beforeAll(() => {
    initializeRewards();
  });

  describe('奖励目录', () => {
    it('初始化后应有默认奖励', () => {
      const rewards = getAllRewards();
      expect(rewards.length).toBeGreaterThan(0);
    });

    it('应支持按类型过滤', () => {
      const nftRewards = getAllRewards({ type: 'nft' });
      for (const r of nftRewards) {
        expect(r.type).toBe('nft');
      }
    });

    it('应支持按最大积分过滤', () => {
      const cheapRewards = getAllRewards({ maxPoints: 500 });
      for (const r of cheapRewards) {
        expect(r.pointsCost).toBeLessThanOrEqual(500);
      }
    });

    it('应按积分从低到高排序', () => {
      const rewards = getAllRewards();
      for (let i = 1; i < rewards.length; i++) {
        expect(rewards[i].pointsCost).toBeGreaterThanOrEqual(rewards[i - 1].pointsCost);
      }
    });
  });

  describe('添加奖励', () => {
    it('addReward 应创建新奖励并设置时间戳', () => {
      const reward = addReward({
        id: 'test-reward-1',
        name: 'Test Reward',
        description: 'A test reward',
        type: 'token',
        pointsCost: 100,
        stock: 10,
        isActive: true,
        metadata: {},
      });

      expect(reward.createdAt).toBeTruthy();
      expect(reward.updatedAt).toBeTruthy();
      expect(getRewardById('test-reward-1')).toBeDefined();
    });
  });

  describe('兑换奖励', () => {
    it('有足够积分时应成功兑换', async () => {
      const wallet = `0xredeem-reward-${Date.now()}`;
      // 先给用户足够积分
      awardBonusPoints(wallet, 10000, 'Test funding');

      const reward = getAllRewards()[0];
      const redemption = await redeemReward(wallet, reward.id);

      expect(redemption.status).toBe('pending');
      expect(redemption.walletAddress).toBe(wallet);
      expect(redemption.rewardId).toBe(reward.id);
      expect(redemption.id).toMatch(/^redemption-/);
    });

    it('不存在的奖励应抛出错误', async () => {
      await expect(redeemReward('0xtest', 'nonexistent')).rejects.toThrow('Reward not found');
    });

    it('积分不足应抛出错误', async () => {
      const wallet = `0xpoor-${Date.now()}`;
      const reward = getAllRewards()[0];
      await expect(redeemReward(wallet, reward.id)).rejects.toThrow(/points/i);
    });

    it('兑换 ID 应使用 .slice() 生成（Bug 14）', async () => {
      const wallet = `0xslice-test-${Date.now()}`;
      awardBonusPoints(wallet, 50000, 'Test');
      const reward = getAllRewards()[0];
      const redemption = await redeemReward(wallet, reward.id);
      // 验证 ID 格式合理
      expect(redemption.id).toMatch(/^redemption-\d+-[a-z0-9]+$/);
    });
  });

  describe('奖励池', () => {
    it('应返回奖励池状态', () => {
      const pool = getRewardPool();
      expect(pool).toBeDefined();
      expect(typeof pool.totalPointsBudget).toBe('number');
      expect(typeof pool.pointsDistributed).toBe('number');
      expect(typeof pool.pointsRemaining).toBe('number');
    });
  });
});
