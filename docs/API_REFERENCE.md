# 🔌 OpenClaw Delegate - 完整 API 参考

## 概述

OpenClaw Delegate 是一个多链多DAO治理聚合平台，提供完整的 RESTful API 支持用户参与治理、赚取积分、兑换奖励。

**Base URL**: `http://localhost:3001/api`

---

## 📋 DAO Management APIs

### 获取所有 DAO
```http
GET /api/daos
```

**查询参数**:
- `active` (boolean): 只返回活跃的 DAO
- `chain` (string): 按链过滤 (ethereum, arbitrum, optimism, polygon)
- `tier` (number): 按等级过滤 (1-5)

**响应示例**:
```json
{
  "total": 20,
  "daos": [
    {
      "id": "aave.eth",
      "name": "Aave",
      "chain": "ethereum",
      "tier": 1,
      "pointsPerVote": 100,
      "governanceType": "both",
      "isActive": true
    }
  ]
}
```

### 获取特定 DAO 详情
```http
GET /api/daos/:daoId
```

**响应示例**:
```json
{
  "dao": { ... },
  "stats": {
    "totalProposals": 150,
    "activeProposals": 3,
    "totalVotes": 5000,
    "uniqueVoters": 1200
  },
  "recentProposals": [ ... ]
}
```

### 获取DAO的提案
```http
GET /api/daos/:daoId/proposals
```

**查询参数**:
- `state` (string): active, closed, executed
- `limit` (number): 返回数量限制

---

## 📊 提案 APIs

### 获取所有提案
```http
GET /api/proposals
```

**查询参数**:
- `daoId` (string): 按 DAO 过滤
- `state` (string): 按状态过滤
- `limit` (number): 限制数量

**响应示例**:
```json
{
  "total": 2,
  "proposals": [
    {
      "id": "0x...",
      "daoName": "Arbitrum DAO",
      "title": "DVP Quorum Implementation",
      "state": "active",
      "voteCount": 1459,
      "startTime": 1770313460,
      "endTime": 1770918260
    }
  ]
}
```

### 获取特定提案
```http
GET /api/proposals/:proposalId
```

**响应包含**: 提案详情 + 投票记录

---

## 🗳️ 投票 APIs

### 提交投票（记录意向）
```http
POST /api/vote
```

**请求体**:
```json
{
  "proposalId": "0x...",
  "direction": 0,
  "walletAddress": "0x...",
  "votingPower": "1000",
  "reason": "I support this proposal"
}
```

**响应示例**:
```json
{
  "vote": {
    "id": "vote-...",
    "pointsEarned": 80
  },
  "points": {
    "amount": 80,
    "reason": "Voted on arbitrumfoundation.eth proposal"
  }
}
```

### 真实投票（需要私钥）
```http
POST /api/cast-vote
```

**请求体**:
```json
{
  "proposalId": "0x...",
  "daoSpace": "aave.eth",
  "governanceType": "snapshot",
  "choice": 1,
  "reason": "Support this upgrade",
  "privateKey": "0x..."
}
```

**响应示例**:
```json
{
  "success": true,
  "vote": {
    "ipfs": "QmXxx...",
    "txHash": "0x..."
  },
  "points": {
    "amount": 100
  }
}
```

### 检查投票权
```http
POST /api/check-voting-power
```

**请求体**:
```json
{
  "space": "aave.eth",
  "address": "0x...",
  "proposalId": "0x..."
}
```

---

## 💎 积分系统 APIs

### 获取用户积分
```http
GET /api/points/:address
```

**响应示例**:
```json
{
  "userId": "0x...",
  "totalPoints": 640,
  "availablePoints": 140,
  "redeemedPoints": 500,
  "level": 2,
  "streak": 3
}
```

### 获取用户详细统计
```http
GET /api/points/:address/stats
```

**响应示例**:
```json
{
  "user": { ... },
  "stats": {
    "totalVotes": 8,
    "uniqueDAOs": 3,
    "currentStreak": 3,
    "averagePointsPerVote": 80
  },
  "level": {
    "current": {
      "level": 2,
      "name": "Participant",
      "minPoints": 500
    },
    "next": {
      "level": 3,
      "name": "Active Member",
      "minPoints": 2000
    },
    "progress": 9
  }
}
```

### 获取交易历史
```http
GET /api/points/:address/history
```

**查询参数**:
- `limit` (number): 返回数量，默认50

### 获取排行榜
```http
GET /api/leaderboard
```

**查询参数**:
- `limit` (number): 返回数量，默认100

**响应示例**:
```json
{
  "total": 50,
  "leaderboard": [
    {
      "walletAddress": "0x...",
      "totalPoints": 15000,
      "level": 5,
      "streak": 30
    }
  ]
}
```

### 奖励积分（管理员）
```http
POST /api/points/bonus
```

**请求体**:
```json
{
  "walletAddress": "0x...",
  "amount": 500,
  "reason": "Referral bonus"
}
```

---

## 🎁 奖励系统 APIs

### 获取所有奖励
```http
GET /api/rewards
```

**查询参数**:
- `type` (string): token, nft, voucher, benefit, cash
- `active` (boolean): 只返回可用奖励
- `maxPoints` (number): 最大积分限制

**响应示例**:
```json
{
  "total": 9,
  "rewards": [
    {
      "id": "reward-usdc-10",
      "name": "10 USDC",
      "type": "token",
      "pointsCost": 1000,
      "stock": 100,
      "metadata": {
        "tokenAddress": "0x...",
        "tokenAmount": "10000000",
        "tokenSymbol": "USDC",
        "chain": "ethereum"
      }
    }
  ]
}
```

### 兑换奖励
```http
POST /api/rewards/:rewardId/redeem
```

**请求体**:
```json
{
  "walletAddress": "0x..."
}
```

**响应示例**:
```json
{
  "id": "redemption-...",
  "rewardName": "5 ARB Tokens",
  "pointsSpent": 500,
  "status": "pending",
  "createdAt": "2026-02-11T12:30:00.000Z"
}
```

### 获取兑换记录
```http
GET /api/redemptions/user/:address
```

**查询参数**:
- `limit` (number): 返回数量

**响应示例**:
```json
{
  "total": 5,
  "redemptions": [
    {
      "id": "redemption-...",
      "rewardName": "5 ARB Tokens",
      "status": "completed",
      "txHash": "0x...",
      "completedAt": "2026-02-11T12:45:00.000Z"
    }
  ]
}
```

### 处理兑换（管理员）
```http
POST /api/redemptions/:redemptionId/process
```

### 取消兑换（管理员）
```http
POST /api/redemptions/:redemptionId/cancel
```

### 获取奖励池状态
```http
GET /api/reward-pool
```

**响应示例**:
```json
{
  "totalPointsBudget": 1000000,
  "pointsDistributed": 500,
  "pointsRemaining": 999500,
  "tokenBalances": {},
  "nftBalances": {}
}
```

### 获取奖励统计
```http
GET /api/reward-stats
```

---

## 👤 用户管理 APIs

### 创建/注册用户
```http
POST /api/users
```

**请求体**:
```json
{
  "walletAddress": "0x...",
  "username": "alice",
  "email": "alice@example.com",
  "referredBy": "REFER-CODE"
}
```

**响应示例**:
```json
{
  "created": true,
  "user": {
    "id": "0x...",
    "username": "alice",
    "primaryWallet": "0x...",
    "connectedWallets": ["0x..."],
    "preferences": { ... },
    "metadata": {
      "tier": "free",
      "joinedAt": "2026-02-11T12:00:00.000Z"
    }
  }
}
```

### 获取用户信息
```http
GET /api/users/:identifier
```

`identifier` 可以是钱包地址或用户ID

### 更新用户信息
```http
PUT /api/users/:identifier
```

**请求体**:
```json
{
  "username": "新用户名",
  "email": "new@example.com",
  "avatar": "https://..."
}
```

### 获取用户Dashboard
```http
GET /api/users/:identifier/dashboard
```

**响应示例**:
```json
{
  "user": { ... },
  "points": {
    "total": 640,
    "available": 140,
    "level": { ... }
  },
  "activity": {
    "totalVotes": 8,
    "uniqueDAOs": 3,
    "currentStreak": 3,
    "recentVotes": [ ... ]
  },
  "rewards": {
    "total": 1,
    "completed": 1,
    "pending": 0,
    "recent": [ ... ]
  },
  "wallets": [
    {
      "address": "0x...",
      "isPrimary": true,
      "verified": false
    }
  ]
}
```

### 连接额外钱包
```http
POST /api/users/:identifier/wallets
```

**请求体**:
```json
{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

### 断开钱包
```http
DELETE /api/users/:identifier/wallets/:wallet
```

### 更新用户偏好
```http
PUT /api/users/:identifier/preferences
```

**请求体**:
```json
{
  "notifications": {
    "newProposals": true,
    "votingReminders": true,
    "rewardUpdates": false
  },
  "autoVote": {
    "enabled": true,
    "strategy": "ai-recommended",
    "riskTolerance": "medium"
  },
  "privacy": {
    "showOnLeaderboard": true,
    "publicProfile": true
  }
}
```

### 获取推荐码
```http
GET /api/users/:identifier/referral-code
```

**响应示例**:
```json
{
  "referralCode": "ALICE-XY123Z"
}
```

### 搜索用户
```http
GET /api/users/search?q=alice
```

---

## 📈 平台统计 APIs

### 获取平台整体统计
```http
GET /api/platform-stats
```

**响应示例**:
```json
{
  "daos": {
    "total": 20,
    "active": 20,
    "byChain": {
      "ethereum": 17,
      "arbitrum": 1,
      "optimism": 1,
      "polygon": 1
    }
  },
  "proposals": {
    "total": 2,
    "active": 2
  },
  "votes": {
    "total": 8,
    "uniqueVoters": 3,
    "totalPoints": 640
  }
}
```

### 获取积分统计
```http
GET /api/points-stats
```

### 获取用户统计
```http
GET /api/user-stats
```

**响应示例**:
```json
{
  "totalUsers": 1,
  "totalWallets": 1,
  "byTier": {
    "free": 1,
    "premium": 0,
    "vip": 0
  },
  "activeToday": 1
}
```

---

## 🔄 其他 APIs

### 健康检查
```http
GET /api/health
```

### 手动同步提案
```http
POST /api/sync-proposals
```

### 获取投票记录
```http
GET /api/votes
```

**查询参数**:
- `voter` (string): 投票者地址
- `daoId` (string): DAO ID
- `proposalId` (string): 提案 ID
- `limit` (number): 返回数量

---

## 🔒 认证和安全

### 私钥使用
某些需要链上操作的 API（如真实投票）需要提供私钥：

```json
{
  "privateKey": "0x..."
}
```

**⚠️ 安全提示**:
- 私钥仅用于签名交易，不会被存储
- 建议使用专门的投票钱包
- 生产环境应使用 WalletConnect 等更安全的方式

### 验证钱包
```http
POST /api/validate-wallet
```

**请求体**:
```json
{
  "privateKey": "0x..."
}
```

**响应**:
```json
{
  "valid": true,
  "address": "0x..."
}
```

---

## 📝 错误处理

所有 API 错误响应格式：

```json
{
  "error": "Error message description"
}
```

**常见HTTP状态码**:
- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源未找到
- `500`: 服务器内部错误

---

## 🚀 快速开始示例

### 完整用户流程

1. **注册用户**
```bash
curl -X POST http://localhost:3001/api/users \
  -H 'Content-Type: application/json' \
  -d '{"walletAddress":"0xYOUR_WALLET","username":"alice"}'
```

2. **查看活跃提案**
```bash
curl http://localhost:3001/api/proposals?state=active
```

3. **投票赚积分**
```bash
curl -X POST http://localhost:3001/api/vote \
  -H 'Content-Type: application/json' \
  -d '{
    "proposalId":"0x...",
    "direction":0,
    "walletAddress":"0xYOUR_WALLET",
    "votingPower":"1000"
  }'
```

4. **查看积分**
```bash
curl http://localhost:3001/api/points/0xYOUR_WALLET/stats
```

5. **查看可兑换奖励**
```bash
curl http://localhost:3001/api/rewards?active=true
```

6. **兑换奖励**
```bash
curl -X POST http://localhost:3001/api/rewards/reward-usdc-10/redeem \
  -H 'Content-Type: application/json' \
  -d '{"walletAddress":"0xYOUR_WALLET"}'
```

7. **查看用户Dashboard**
```bash
curl http://localhost:3001/api/users/0xYOUR_WALLET/dashboard
```

---

## 📖 更多资源

- [完整指南](./MULTI_DAO_GUIDE.md)
- [项目README](../README.md)
- GitHub Issues: 报告问题和功能请求

---

**Built with ❤️ for DAO Governance**
