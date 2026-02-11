/**
 * Bug 14: .substr() → .slice() 验证
 * 测试用户管理核心逻辑
 */
import { describe, it, expect } from 'vitest';
import {
  createUser,
  getUser,
  updateUser,
  connectWallet,
  disconnectWallet,
  generateReferralCode,
} from '../services/user.js';

describe('user.ts', () => {
  describe('用户创建', () => {
    it('应创建新用户', () => {
      const wallet = `0xuser-create-${Date.now()}`;
      const user = createUser(wallet, { username: 'testuser' });
      expect(user.id).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    it('重复钱包地址应返回已有用户', () => {
      const wallet = `0xuser-dup-${Date.now()}`;
      const user1 = createUser(wallet);
      const user2 = createUser(wallet);
      expect(user1.id).toBe(user2.id);
    });
  });

  describe('用户查询', () => {
    it('getUserById 应返回正确用户', () => {
      const wallet = `0xuser-get-${Date.now()}`;
      const created = createUser(wallet);
      const found = getUser(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('不存在的用户返回 undefined', () => {
      expect(getUser('nonexistent-id')).toBeUndefined();
    });
  });

  describe('钱包管理', () => {
    it('应能连接额外钱包', () => {
      const wallet = `0xuser-wallet-${Date.now()}`;
      const user = createUser(wallet);
      const updated = connectWallet(user.id, `0xextra-${Date.now()}`);
      expect(updated).toBeDefined();
      expect(updated!.connectedWallets.length).toBeGreaterThanOrEqual(2);
    });

    it('应能断开钱包', () => {
      const wallet1 = `0xuser-disc1-${Date.now()}`;
      const wallet2 = `0xuser-disc2-${Date.now()}`;
      const user = createUser(wallet1);
      connectWallet(user.id, wallet2);
      const updated = disconnectWallet(user.id, wallet2);
      expect(updated).toBeDefined();
    });
  });

  describe('推荐码 - Bug 14 .slice() 验证', () => {
    it('应生成有效的推荐码', () => {
      const wallet = `0xuser-ref-${Date.now()}`;
      const user = createUser(wallet, { username: 'reftest' });
      const code = generateReferralCode(user.id);
      expect(code).toBeTruthy();
      expect(typeof code).toBe('string');
      expect(code!.length).toBeGreaterThan(3);
    });

    it('同一用户多次获取应返回相同推荐码', () => {
      const wallet = `0xuser-ref2-${Date.now()}`;
      const user = createUser(wallet, { username: 'reftest2' });
      const code1 = generateReferralCode(user.id);
      const code2 = generateReferralCode(user.id);
      expect(code1).toBe(code2);
    });
  });
});
