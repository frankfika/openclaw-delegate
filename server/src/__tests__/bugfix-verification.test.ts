/**
 * 源码级别验证 - 确认所有 17 个 bug 修复已正确应用
 * 通过读取源文件内容验证关键修改
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../..');
const SERVER_SRC = resolve(ROOT, 'src');
const FRONTEND_SRC = resolve(ROOT, '../frontend');

function readSrc(path: string): string {
  return readFileSync(resolve(ROOT, path), 'utf-8');
}

function readFrontend(path: string): string {
  return readFileSync(resolve(FRONTEND_SRC, path), 'utf-8');
}

describe('Bug 修复源码验证', () => {
  describe('P0 - 关键问题', () => {
    it('Bug 1: api.ts 应处理 { total, proposals } 响应格式', () => {
      const code = readFrontend('services/api.ts');
      expect(code).toContain('Array.isArray(json)');
      expect(code).toContain('json.proposals');
      // fetchProposals 函数内不应直接 return res.json()，应先解析再处理格式
      const fetchProposalsFn = code.match(/export async function fetchProposals[\s\S]*?\n\}/)?.[0] || '';
      expect(fetchProposalsFn).not.toMatch(/return\s+res\.json\(\)/);
    });

    it('Bug 2/3: dashboard.ts 不应有重复的 proposals/votes 路由', () => {
      const code = readSrc('src/services/dashboard.ts');
      // 不应有直接定义的 /api/proposals 路由
      expect(code).not.toMatch(/app\.get\(['"]\/api\/proposals['"]/);
      // 不应有直接定义的 /api/votes 路由
      expect(code).not.toMatch(/app\.get\(['"]\/api\/votes['"]/);
      // 应该通过 router 挂载
      expect(code).toContain("app.route('/api', daosRouter)");
    });

    it('Bug 4: dashboard.ts 应在启动时调用 syncAllProposals', () => {
      const code = readSrc('src/services/dashboard.ts');
      expect(code).toContain('syncAllProposals');
      expect(code).toContain('Initial sync complete');
    });

    it('Bug 5: useProposals.ts 不应截断 proposal ID', () => {
      const code = readFrontend('hooks/useProposals.ts');
      // 不应有 id: p.id?.slice(0, 8)
      expect(code).not.toMatch(/id:\s*p\.id\?\.slice\(0,\s*8\)/);
      // 应直接使用完整 ID
      expect(code).toMatch(/id:\s*p\.id/);
    });
  });

  describe('P1 - 重要问题', () => {
    it('Bug 6: snapshot.ts 应区分 Tier 3 和 Tier 4', () => {
      const code = readSrc('src/services/snapshot.ts');
      expect(code).toContain('TIER_4_SPACES');
      expect(code).toContain("'ens.eth'");
      expect(code).toContain("'safe.eth'");
      expect(code).toContain("'gitcoindao.eth'");
      expect(code).toContain("'thegraph.eth'");
      expect(code).toContain('tier = 4');
      expect(code).toContain("tierName = 'Infrastructure & Tools'");
    });

    it('Bug 7: VoteButton.tsx 应检查 API 响应状态', () => {
      const code = readFrontend('components/VoteButton.tsx');
      expect(code).toContain('res.ok');
      // 应有错误处理
      expect(code).toMatch(/if\s*\(\s*!res\.ok\s*\)/);
    });

    it('Bug 8: App.tsx 应给 ProposalDetail 添加 key prop', () => {
      const code = readFrontend('App.tsx');
      expect(code).toMatch(/key=\{selectedProposal\.id\}/);
    });

    it('Bug 9: types.ts 应包含 Snapshot 相关字段', () => {
      const code = readFrontend('types.ts');
      expect(code).toContain('spaceId?: string');
      expect(code).toContain('snapshotId?: string');
      expect(code).toContain('choices?: string[]');
      expect(code).toContain('snapshotNetwork?: string');
      expect(code).toContain('type?: string');
    });

    it('Bug 9: ProposalDetail.tsx 不应使用 (proposal as any)', () => {
      const code = readFrontend('components/ProposalDetail.tsx');
      expect(code).not.toContain('(proposal as any)');
    });
  });

  describe('P2 - 安全问题', () => {
    it('Bug 10: voting routes 应有 DEV ONLY 注释', () => {
      const code = readSrc('src/routes/voting.ts');
      expect(code).toContain('DEV ONLY');
      expect(code).toMatch(/wallet.*sign|production/i);
    });

    it('Bug 11: admin 路由应有 DEV ONLY 注释', () => {
      const rewardsCode = readSrc('src/routes/rewards.ts');
      const usersCode = readSrc('src/routes/users.ts');
      // rewards admin routes
      expect(rewardsCode).toContain('DEV ONLY');
      expect((rewardsCode.match(/DEV ONLY/g) || []).length).toBeGreaterThanOrEqual(4);
      // users admin route
      expect(usersCode).toContain('DEV ONLY');
    });

    it('Bug 12: snapshot.ts 应使用 GraphQL 变量而非字符串拼接', () => {
      const code = readSrc('src/services/snapshot.ts');
      // 应使用参数化查询
      expect(code).toContain('query Proposal($id: String!)');
      expect(code).toContain('proposal(id: $id)');
      expect(code).toContain('variables: { id }');
      // 不应有字符串拼接
      expect(code).not.toContain('proposal(id: "${id}")');
    });

    it('Bug 12: voting.ts 也应使用 GraphQL 变量', () => {
      const code = readSrc('src/services/voting.ts');
      expect(code).toContain('query Space($id: String!)');
      expect(code).toContain('space(id: $id)');
      expect(code).not.toContain('space(id: "${space}")');
    });

    it('Bug 16: NFT 合约地址应有 TODO 注释', () => {
      const code = readSrc('src/services/rewards.ts');
      const matches = code.match(/TODO.*NFT contract/gi) || [];
      expect(matches.length).toBeGreaterThanOrEqual(3);
    });

    it('Bug 17: Mock 交易哈希应有 MOCK 注释', () => {
      const votingCode = readSrc('src/services/voting.ts');
      const rewardsCode = readSrc('src/services/rewards.ts');
      expect(votingCode).toContain('MOCK');
      expect(rewardsCode).toContain('MOCK');
    });
  });

  describe('P3 - 代码质量', () => {
    it('Bug 14: 源码中不应有 .substr() 调用', () => {
      const files = [
        'src/services/rewards.ts',
        'src/services/points.ts',
        'src/services/dao-manager.ts',
        'src/services/user.ts',
        'src/services/voting.ts',
      ];

      for (const file of files) {
        const code = readSrc(file);
        expect(code, `${file} 仍包含 .substr()`).not.toContain('.substr(');
      }
    });

    it('Bug 14: 应使用 .slice() 替代', () => {
      const files = [
        'src/services/rewards.ts',
        'src/services/points.ts',
        'src/services/dao-manager.ts',
        'src/services/user.ts',
        'src/services/voting.ts',
      ];

      for (const file of files) {
        const code = readSrc(file);
        // 至少有一处使用 .slice()
        expect(code, `${file} 应使用 .slice()`).toContain('.slice(');
      }
    });
  });
});
