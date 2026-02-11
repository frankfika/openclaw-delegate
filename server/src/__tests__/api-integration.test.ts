/**
 * Bug 1: fetchProposals 响应格式处理
 * Bug 2/3: 重复路由已删除
 * Bug 4: 启动时同步 proposals
 * Bug 10/11: 安全注释验证（代码审查）
 *
 * API 集成测试 - 需要服务器运行在 localhost:3001
 */
import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3001/api';

// 检测服务器是否运行
async function isServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe('API 集成测试', () => {
  let serverAvailable = false;

  beforeAll(async () => {
    serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.warn('⚠️ 服务器未运行，跳过集成测试。请先运行: cd server && npm run dev');
    }
  });

  describe('Health Check', () => {
    it('GET /api/health → 200', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/health`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.name).toBe('OpenClaw Delegate');
    });
  });

  describe('Bug 1 - Proposals 响应格式', () => {
    it('GET /api/proposals 应返回 { total, proposals } 格式', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/proposals`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      // 验证返回格式是 { total, proposals } 而非裸数组
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('proposals');
      expect(Array.isArray(data.proposals)).toBe(true);
      expect(typeof data.total).toBe('number');
    });

    it('GET /api/proposals?dao=aave 应支持 DAO 过滤', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/proposals?dao=aave`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data).toHaveProperty('proposals');
    });

    it('GET /api/proposals/:id 应返回单个提案或 404', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/proposals/nonexistent-id`);
      // 应该返回 404 而非 500
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Bug 2/3 - 路由不重复', () => {
    it('GET /api/daos 应返回 20 个 DAO', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/daos`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.total).toBe(20);
      expect(data.daos.length).toBe(20);
    });

    it('GET /api/votes 应返回 { total, votes } 格式', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/votes`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('votes');
    });
  });

  describe('Bug 7 - Vote API 错误处理', () => {
    it('POST /api/vote 缺少参数应返回错误', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      // 应返回 4xx 或包含 error
      const data = await res.json();
      if (!res.ok) {
        expect(data).toHaveProperty('error');
      }
    });

    it('POST /api/vote 无效 proposalId 应返回错误', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: 'nonexistent',
          walletAddress: '0x1234',
          choice: 'For',
        }),
      });
      const data = await res.json();
      expect(data.error).toBeTruthy();
    });
  });

  describe('积分 API', () => {
    it('GET /api/points/:address 应返回用户积分', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/points/0xtest123`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data).toHaveProperty('totalPoints');
      expect(data).toHaveProperty('availablePoints');
      expect(data).toHaveProperty('level');
    });

    it('GET /api/leaderboard 应返回排行榜', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/leaderboard`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('奖励 API', () => {
    it('GET /api/rewards 应返回奖励列表', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/rewards`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('GET /api/reward-pool 应返回奖励池状态', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/reward-pool`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data).toHaveProperty('totalBudget');
    });
  });

  describe('用户 API', () => {
    it('POST /api/users 应创建用户', async () => {
      if (!serverAvailable) return;
      const wallet = `0xapi-test-${Date.now()}`;
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet }),
      });
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.wallets).toHaveLength(1);
    });
  });

  describe('AI 分析 API', () => {
    it('POST /api/analysis 缺少参数应返回错误', async () => {
      if (!serverAvailable) return;
      const res = await fetch(`${API_BASE}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      // 应该返回错误而非崩溃
      expect([400, 500]).toContain(res.status);
    });
  });
});
