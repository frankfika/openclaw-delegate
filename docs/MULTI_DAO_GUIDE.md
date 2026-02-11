# 🏛️ OpenClaw Delegate - 多链多DAO治理聚合器

## 📋 概述

这是一个**治理聚合器平台**，用户通过平台参与不同链上的多个DAO治理，既能获得原DAO的奖励，也能获得平台额外的积分奖励。

### 核心价值主张

```
用户参与治理 → 获得原DAO奖励 + 平台积分 → 平台额外奖励
                          ↓
                多链、多DAO统一入口
```

## 🎯 已实现功能

### 1. 多链多DAO支持 ✅

**追踪 20 个顶级 DAO，横跨 4 条链：**

#### Tier 1 - 顶级 DeFi 协议（100分/投票）
- Aave (Ethereum)
- Uniswap (Ethereum)
- Curve (Ethereum)
- Compound (Ethereum)

#### Tier 2 - L2 & 基础设施（80分/投票）
- Arbitrum DAO (Arbitrum)
- Optimism (Optimism)
- Stargate (Ethereum)
- Polygon (Polygon)

#### Tier 3 - 成熟 DeFi（60分/投票）
- Lido (Ethereum)
- Balancer (Ethereum)
- SushiSwap (Ethereum)
- Hop Protocol (Ethereum)
- 1inch (Ethereum)

#### Tier 4 - 基础设施工具（60分/投票）
- ENS (Ethereum)
- Safe (Ethereum)
- Gitcoin (Ethereum)
- The Graph (Ethereum)

#### Tier 5 - 社区项目（40分/投票）
- ParaSwap (Ethereum)
- Olympus DAO (Ethereum)
- ApeCoin DAO (Ethereum)

### 2. 积分系统 ✅

**用户通过以下方式赚取积分：**
- ✅ 投票获得基础积分（根据DAO等级）
- ✅ 早期投票奖励（提案开始24小时内 +20%）
- ✅ 连续投票奖励（连续天数最高 +50%）
- ✅ 特殊活动奖励

**用户等级系统：**
1. Newcomer（新手）: 0+ 积分
2. Participant（参与者）: 500+ 积分
3. Active Member（活跃成员）: 2000+ 积分
4. Power Voter（强力投票者）: 5000+ 积分
5. Governance Expert（治理专家）: 10000+ 积分
6. DAO Legend（DAO传奇）: 25000+ 积分

### 3. 统一数据管理 ✅

- ✅ 跨链提案聚合
- ✅ 投票记录追踪
- ✅ DAO统计分析
- ✅ 平台级数据分析

## 🔌 API 端点

### DAO 管理

```bash
# 获取所有 DAO
GET /api/daos?active=true&chain=ethereum&tier=1

# 获取特定 DAO 详情
GET /api/daos/{daoId}

# 获取 DAO 的提案
GET /api/daos/{daoId}/proposals?state=active

# 获取 DAO 统计
GET /api/daos/{daoId}/stats

# 获取所有 DAO 统计
GET /api/daos/stats/all

# 手动同步提案
POST /api/sync-proposals
```

### 提案查询

```bash
# 获取所有提案
GET /api/proposals?daoId=aave.eth&state=active&limit=20

# 获取特定提案
GET /api/proposals/{proposalId}
```

### 投票

```bash
# 提交投票（自动获得积分）
POST /api/vote
{
  "proposalId": "0x...",
  "direction": 0,
  "walletAddress": "0x...",
  "votingPower": "1000",
  "reason": "Support this proposal"
}

# 获取投票记录
GET /api/votes?voter=0x...&daoId=aave.eth
```

### 积分系统

```bash
# 获取用户积分
GET /api/points/{address}

# 获取用户统计
GET /api/points/{address}/stats

# 获取交易历史
GET /api/points/{address}/history

# 获取排行榜
GET /api/leaderboard?limit=100

# 兑换积分
POST /api/points/redeem
{
  "walletAddress": "0x...",
  "amount": 1000,
  "reason": "Redeem for NFT"
}

# 奖励积分（管理员）
POST /api/points/bonus
{
  "walletAddress": "0x...",
  "amount": 500,
  "reason": "Referral bonus"
}
```

### 平台统计

```bash
# 获取平台整体统计
GET /api/platform-stats

# 获取积分统计
GET /api/points-stats
```

## 💡 使用示例

### 示例 1: 查看所有 Tier 1 DAOs

```bash
curl -s 'http://localhost:3001/api/daos' | \
  jq '.daos[] | select(.tier == 1) | {name, chain, points: .pointsPerVote}'
```

### 示例 2: 用户投票并获得积分

```bash
# 1. 查看活跃提案
curl http://localhost:3001/api/proposals?state=active

# 2. 提交投票
curl -X POST http://localhost:3001/api/vote \
  -H 'Content-Type: application/json' \
  -d '{
    "proposalId": "0x...",
    "direction": 0,
    "walletAddress": "0xYourWallet",
    "votingPower": "1000"
  }'

# 3. 查看获得的积分
curl http://localhost:3001/api/points/0xYourWallet/stats
```

### 示例 3: 查看排行榜

```bash
curl http://localhost:3001/api/leaderboard | \
  jq '.leaderboard[0:10] | .[] | {wallet: .walletAddress, points: .totalPoints, level: .level}'
```

## 📊 实际运行数据

当前平台状态：
- ✅ 20 个活跃 DAO
- ✅ 横跨 4 条链（Ethereum, Arbitrum, Optimism, Polygon）
- ✅ 实时提案同步
- ✅ 自动积分奖励

### 示例投票奖励计算

假设用户在 Arbitrum DAO（Tier 2）投票：

```
基础积分: 80分
早期投票 (+20%): 16分
连续3天 (+10%): 8分
-------------------
总计: 104分
```

## 🚀 待实现功能

### 1. 真实投票功能（任务 #4）
- [ ] 集成 @snapshot-labs/snapshot.js
- [ ] 钱包签名
- [ ] 链上投票支持（Compound, Uniswap Governor）

### 2. 奖励分发系统（任务 #3）
- [ ] 奖励池管理
- [ ] 自动分发机制
- [ ] Token/NFT 奖励

### 3. 用户管理系统（任务 #5）
- [ ] 用户注册/登录
- [ ] 多钱包绑定
- [ ] 投票历史面板

### 4. 高级功能
- [ ] AI 投票建议
- [ ] 风险评估
- [ ] 提案摘要
- [ ] Telegram 通知

## 🔧 技术栈

- **后端**: Node.js + TypeScript + Hono
- **数据源**: Snapshot GraphQL API
- **积分**: 内存存储（生产环境需数据库）
- **前端**: React + Vite
- **链上**: ethers.js（待集成）

## 📝 配置

在 `.env` 文件中配置：

```env
# DeepSeek AI（用于提案分析）
DEEPSEEK_API_KEY=sk-...

# Telegram 通知
TELEGRAM_BOT_TOKEN=...

# 链RPC
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# 服务器
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 🎮 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API keys

# 3. 启动服务
npm run dev

# 4. 访问
# 前端: http://localhost:3000
# API: http://localhost:3001
# Dashboard: http://localhost:3001/api/proposals
```

## 📈 商业模式

### 用户价值
1. **统一入口**: 一站式参与多链多DAO治理
2. **额外奖励**: 除原DAO奖励外，获得平台积分
3. **简化流程**: 不需要分别关注每个DAO
4. **智能建议**: AI分析帮助决策

### 平台收入
1. **服务费**: 从DAO奖励中抽取小比例
2. **Premium订阅**: 高级功能（更多通知、深度分析）
3. **广告位**: DAO项目方推广
4. **数据服务**: 治理数据分析API

## 🤝 贡献

欢迎贡献！优先级任务：
1. 实现真实的 Snapshot 投票功能
2. 添加更多链的支持（Solana, Cosmos 等）
3. 创建用户Dashboard前端
4. 集成链上治理合约

## 📄 许可证

MIT License

---

**Built with ❤️ for DAO Governance**
