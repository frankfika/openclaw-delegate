/**
 * Bug 6: getDAOTier 跳过 Tier 4
 * Bug 12: GraphQL 参数化查询（结构验证）
 *
 * 测试 snapshot.ts 中的 getDAOTier 和 getPointsForDAO
 */
import { describe, it, expect } from 'vitest';
import { getDAOTier, getPointsForDAO, getTrackedSpaces } from '../services/snapshot.js';

describe('snapshot.ts', () => {
  describe('Bug 6 - getDAOTier 应正确区分 Tier 3 和 Tier 4', () => {
    it('Tier 1: Aave/Uniswap/Curve/Compound → tier=1, points=100', () => {
      for (const space of ['aave.eth', 'uniswapgovernance.eth', 'curve-dao.eth', 'compoundgrants.eth']) {
        const result = getDAOTier(space);
        expect(result.tier).toBe(1);
        expect(result.points).toBe(100);
        expect(result.name).toBe('Major DeFi');
      }
    });

    it('Tier 2: Arbitrum/Optimism/Stargate/Polygon → tier=2, points=80', () => {
      for (const space of ['arbitrumfoundation.eth', 'optimismgov.eth', 'stgdao.eth', 'polygonfoundation.eth']) {
        const result = getDAOTier(space);
        expect(result.tier).toBe(2);
        expect(result.points).toBe(80);
        expect(result.name).toBe('L2 & Infrastructure');
      }
    });

    it('Tier 3: Lido/Balancer/SushiSwap 等 → tier=3, points=60', () => {
      for (const space of ['lido-snapshot.eth', 'balancer.eth', 'sushigov.eth', 'hop.eth', '1inch.eth']) {
        const result = getDAOTier(space);
        expect(result.tier).toBe(3);
        expect(result.points).toBe(60);
        expect(result.name).toBe('Established DeFi');
      }
    });

    it('Tier 4: ENS/Safe/Gitcoin/The Graph → tier=4, points=60（修复前会错误返回 tier=3）', () => {
      for (const space of ['ens.eth', 'safe.eth', 'gitcoindao.eth', 'thegraph.eth']) {
        const result = getDAOTier(space);
        expect(result.tier).toBe(4);
        expect(result.points).toBe(60);
        expect(result.name).toBe('Infrastructure & Tools');
      }
    });

    it('Tier 5: ParaSwap/Olympus/ApeCoin → tier=5, points=40', () => {
      for (const space of ['paraswap-dao.eth', 'olympusdao.eth', 'apecoin.eth']) {
        const result = getDAOTier(space);
        expect(result.tier).toBe(5);
        expect(result.points).toBe(40);
        expect(result.name).toBe('Community');
      }
    });

    it('未知 DAO → tier=5, points=20（默认）', () => {
      const result = getDAOTier('unknown-dao.eth');
      expect(result.tier).toBe(5);
      expect(result.points).toBe(20);
    });
  });

  describe('getTrackedSpaces', () => {
    it('应返回 20 个 DAO 空间', () => {
      const spaces = getTrackedSpaces();
      expect(spaces.length).toBe(20);
    });

    it('应包含所有 5 个 tier 的 DAO', () => {
      const spaces = getTrackedSpaces();
      expect(spaces).toContain('aave.eth');        // tier 1
      expect(spaces).toContain('arbitrumfoundation.eth'); // tier 2
      expect(spaces).toContain('lido-snapshot.eth'); // tier 3
      expect(spaces).toContain('ens.eth');          // tier 4
      expect(spaces).toContain('apecoin.eth');      // tier 5
    });
  });

  describe('getPointsForDAO', () => {
    it('各 tier 积分正确', () => {
      expect(getPointsForDAO('aave.eth')).toBe(100);
      expect(getPointsForDAO('arbitrumfoundation.eth')).toBe(80);
      expect(getPointsForDAO('lido-snapshot.eth')).toBe(60);
      expect(getPointsForDAO('ens.eth')).toBe(60);
      expect(getPointsForDAO('apecoin.eth')).toBe(40);
      expect(getPointsForDAO('nonexistent.eth')).toBe(20); // default
    });
  });
});
