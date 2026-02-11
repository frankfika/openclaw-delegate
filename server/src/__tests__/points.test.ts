/**
 * Bug 14: .substr() 替换为 .slice()
 * 测试积分系统核心逻辑
 */
import { describe, it, expect } from 'vitest';
import {
  awardVotePoints,
  redeemPoints,
  awardBonusPoints,
  getUserPoints,
  getLeaderboard,
} from '../services/points.js';

describe('points.ts', () => {
  const testWallet = `0xtest-${Date.now()}`;

  describe('awardVotePoints - 投票积分奖励', () => {
    it('Tier 1 DAO 基础积分应为 100', () => {
      const wallet = `0xpoints-tier1-${Date.now()}`;
      const tx = awardVotePoints(wallet, 'proposal-1', 'aave.eth');
      expect(tx.amount).toBeGreaterThanOrEqual(100);
      expect(tx.type).toBe('earn');
      expect(tx.metadata.daoTier).toBe(1);
    });

    it('Tier 5 DAO 基础积分应为 40', () => {
      const wallet = `0xpoints-tier5-${Date.now()}`;
      const tx = awardVotePoints(wallet, 'proposal-2', 'apecoin.eth');
      expect(tx.amount).toBeGreaterThanOrEqual(40);
      expect(tx.metadata.daoTier).toBe(5);
    });

    it('早期投票应获得 20% 额外奖励', () => {
      const wallet = `0xpoints-early-${Date.now()}`;
      const tx = awardVotePoints(wallet, 'proposal-3', 'aave.eth', true);
      // 100 base + 20 early = 120
      expect(tx.amount).toBe(120);
      expect(tx.metadata.earlyVoteBonus).toBe(true);
    });

    it('交易 ID 应使用 .slice() 生成（Bug 14 修复验证）', () => {
      const wallet = `0xpoints-id-${Date.now()}`;
      const tx = awardVotePoints(wallet, 'proposal-4', 'aave.eth');
      expect(tx.id).toMatch(/^tx-\d+-[a-z0-9]+$/);
      // .slice(2, 11) 生成最多 9 字符
      const randomPart = tx.id.split('-').slice(2).join('-');
      expect(randomPart.length).toBeGreaterThan(0);
      expect(randomPart.length).toBeLessThanOrEqual(9);
    });
  });

  describe('redeemPoints - 积分兑换', () => {
    it('有足够积分时应成功兑换', () => {
      const wallet = `0xredeem-ok-${Date.now()}`;
      // 先奖励积分
      awardVotePoints(wallet, 'p1', 'aave.eth');
      // 兑换部分
      const tx = redeemPoints(wallet, 50, 'Test redeem');
      expect(tx).not.toBeNull();
      expect(tx!.amount).toBe(-50);
      expect(tx!.type).toBe('redeem');
    });

    it('积分不足时应抛出错误', () => {
      const wallet = `0xredeem-fail-${Date.now()}`;
      expect(() => redeemPoints(wallet, 1000, 'Too much')).toThrow('Insufficient points');
    });
  });

  describe('awardBonusPoints - 额外积分', () => {
    it('应正确奖励额外积分', () => {
      const wallet = `0xbonus-${Date.now()}`;
      const tx = awardBonusPoints(wallet, 500, 'Referral bonus');
      expect(tx.amount).toBe(500);
      expect(tx.type).toBe('bonus');
    });
  });

  describe('getUserPoints - 用户积分查询', () => {
    it('新用户应有 0 积分', () => {
      const wallet = `0xnew-user-${Date.now()}`;
      const user = getUserPoints(wallet);
      expect(user.totalPoints).toBe(0);
      expect(user.availablePoints).toBe(0);
      expect(user.level).toBe(1);
    });

    it('奖励后积分应正确累加', () => {
      const wallet = `0xaccum-${Date.now()}`;
      awardVotePoints(wallet, 'p1', 'aave.eth');  // 100
      awardVotePoints(wallet, 'p2', 'apecoin.eth'); // 40
      const user = getUserPoints(wallet);
      expect(user.totalPoints).toBeGreaterThanOrEqual(140);
    });
  });

  describe('getLeaderboard - 排行榜', () => {
    it('应返回按积分排序的用户列表', () => {
      const board = getLeaderboard(10);
      expect(Array.isArray(board)).toBe(true);
      // 验证排序
      for (let i = 1; i < board.length; i++) {
        expect(board[i - 1].totalPoints).toBeGreaterThanOrEqual(board[i].totalPoints);
      }
    });
  });
});
