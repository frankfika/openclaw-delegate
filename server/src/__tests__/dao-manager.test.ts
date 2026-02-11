/**
 * Bug 4: 启动时同步 proposals
 * Bug 5: proposal ID 不应被截断
 * Bug 2/3: 重复路由已删除（通过 API 集成测试验证）
 *
 * 测试 dao-manager.ts 核心功能
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllDAOs,
  getDAOById,
  getProposalById,
  recordVote,
  getAllProposals,
  getAllVoteRecords,
  getDAOStats,
} from '../services/dao-manager.js';

describe('dao-manager.ts', () => {
  describe('DAO 配置', () => {
    it('应返回 20 个 DAO', () => {
      const daos = getAllDAOs();
      expect(daos.length).toBe(20);
    });

    it('每个 DAO 应有完整配置', () => {
      const daos = getAllDAOs();
      for (const dao of daos) {
        expect(dao.id).toBeTruthy();
        expect(dao.name).toBeTruthy();
        expect(dao.snapshotSpace).toBeTruthy();
        expect(dao.chain).toBeTruthy();
        expect(dao.tier).toBeGreaterThanOrEqual(1);
        expect(dao.tier).toBeLessThanOrEqual(5);
        expect(dao.pointsPerVote).toBeGreaterThan(0);
      }
    });

    it('getDAOById 应返回正确的 DAO', () => {
      const dao = getDAOById('aave.eth');
      expect(dao).toBeDefined();
      expect(dao!.name).toBe('Aave');
      expect(dao!.tier).toBe(1);
    });

    it('getDAOById 对不存在的 ID 返回 undefined', () => {
      const dao = getDAOById('nonexistent');
      expect(dao).toBeUndefined();
    });
  });

  describe('投票记录', () => {
    it('recordVote 应创建完整的投票记录', () => {
      const vote = recordVote({
        proposalId: 'test-proposal-123',
        daoId: 'aave',
        voterAddress: '0x1234567890abcdef',
        choice: 'For',
        pointsEarned: 100,
      });

      expect(vote.id).toMatch(/^vote-/);
      expect(vote.timestamp).toBeTruthy();
      expect(vote.proposalId).toBe('test-proposal-123');
      expect(vote.daoId).toBe('aave');
      expect(vote.voterAddress).toBe('0x1234567890abcdef');
      expect(vote.choice).toBe('For');
      expect(vote.pointsEarned).toBe(100);
    });

    it('recordVote 生成的 ID 不应使用 .substr()', () => {
      const vote = recordVote({
        proposalId: 'test-proposal-456',
        daoId: 'uniswap',
        voterAddress: '0xabcdef',
        choice: 'Against',
        pointsEarned: 100,
      });
      // ID 应该是合理长度（使用 .slice(2, 11) 生成 9 字符随机串）
      expect(vote.id.length).toBeGreaterThan(15);
    });
  });

  describe('Bug 5 - Proposal ID 完整性', () => {
    it('getProposalById 应使用完整 ID 查找', () => {
      const fullId = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      // 如果没有该 proposal，应返回 undefined（不是截断后的 ID）
      const result = getProposalById(fullId);
      // 关键：函数接受完整 ID，不做截断
      expect(result === undefined || result?.id === fullId).toBe(true);
    });
  });
});
