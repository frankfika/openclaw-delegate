# VoteNow Technical Stack Overview

## Architecture Summary

**Type**: Full-stack Web3 application with AI integration
**Deployment Model**: Serverless-ready (Edge functions + Static frontend)
**Current State**: MVP running locally, production-ready codebase

---

## Tech Stack Breakdown

### 🎨 Frontend Layer

#### Core Framework
- **React 19**: Latest with concurrent features, transitions, Server Components ready
- **Vite 6**: Ultra-fast HMR (<50ms), optimized production builds
- **TypeScript**: Full type safety across 13+ components

#### Styling & UI
- **Tailwind CSS**: Utility-first, responsive design system
- **Recharts**: Data visualization (leaderboard charts, points graphs, DAO analytics)
- **Responsive**: Mobile-first design (desktop/tablet/mobile)

#### Web3 Integration
| Library | Version | Purpose |
|---------|---------|---------|
| **wagmi** | 2.x | React hooks for Ethereum (wallet connection, chain switching) |
| **viem** | 2.x | TypeScript interface for Ethereum (modern alternative to ethers) |
| **@snapshot-labs/snapshot.js** | 0.14.x | Off-chain voting (EIP-712 signatures) |
| **ethers** | 5.8.x | Utilities (vote verification, parsing) |

**Supported Wallets**:
- MetaMask
- WalletConnect (any mobile wallet)
- Coinbase Wallet
- Rainbow Wallet

**Supported Chains** (Multi-chain from Day 1):
```javascript
const chains = [
  mainnet,      // Ethereum
  arbitrum,     // Arbitrum One
  optimism,     // Optimism
  polygon,      // Polygon PoS
  // Roadmap: base, zkSync, avalanche, bsc
]
```

#### Key Components
```
frontend/src/components/
├── Dashboard.tsx           # Main view: metrics, recent votes
├── ProposalDetail.tsx      # Full proposal + AI analysis panel
├── VoteButton.tsx          # One-click Snapshot voting
├── PointsPanel.tsx         # User level, streak, points display
├── Leaderboard.tsx         # Top 100 voters, charts
├── RewardsShop.tsx         # Browse & redeem rewards
├── ProposalsQueue.tsx      # Filterable list (chain/DAO filters)
├── WalletConnect.tsx       # Multi-chain wallet connection
└── ChatPanel.tsx           # AI chat interface
```

---

### ⚙️ Backend Layer

#### API Framework
- **Hono**: Ultra-lightweight (5KB), edge-compatible, 3x faster than Express
  - Runs on Node.js, Cloudflare Workers, Deno, Bun
  - Built-in TypeScript support
  - Middleware: CORS, rate limiting, auth

#### Language & Runtime
- **TypeScript**: Strict mode, full type coverage
- **Node.js**: v18+ (LTS), ES modules
- **Testing**: Vitest (75 tests, 90%+ coverage)

#### Data Storage
**Current (MVP)**:
- In-memory Maps (userPoints, votes, rewards)
- Session-based, fast for development

**Production (Roadmap)**:
```
PostgreSQL (Relational Data)
├── users (wallet, points, level, streak)
├── votes (proposalId, voter, choice, timestamp)
├── rewards (catalog, redemptions)
└── dao_configs (metadata, tiers)

Redis (Cache & Real-time)
├── Proposal cache (24hr TTL)
├── User sessions
├── Rate limiting counters
└── Leaderboard (sorted sets)
```

#### API Routes (42+ Endpoints)
```typescript
// Core
GET  /api/health
GET  /api/proposals?dao=aave&chain=ethereum
GET  /api/daos
POST /api/vote
POST /api/analysis
POST /api/chat

// Points & Rewards
GET  /api/points/:address
GET  /api/leaderboard
GET  /api/rewards
POST /api/rewards/:id/redeem
GET  /api/users/:id/dashboard

// DAOs
GET  /api/daos/:id
GET  /api/daos/:id/proposals
POST /api/sync-proposals
```

#### Service Modules
```
server/src/services/
├── dao-manager.ts          # Multi-DAO state, proposal sync
├── snapshot.ts             # Snapshot GraphQL queries
├── llm.ts                  # DeepSeek AI integration
├── points.ts               # Points calculation, levels
├── rewards.ts              # Reward catalog, redemption
├── voting.ts               # Voting power queries
└── telegram.ts             # Bot notifications (WIP)
```

---

### 🤖 AI Layer

#### LLM Provider
**DeepSeek** (via OpenAI-compatible API)
- **Model**: `deepseek-chat` (R1-based reasoning)
- **Cost**: $0.27 per 1M input tokens (20x cheaper than GPT-4)
- **Speed**: 30 tokens/sec, 3-5s for full analysis
- **Context**: 32K tokens (enough for full proposal text)

#### AI Features

**1. Proposal Analysis**
```typescript
POST /api/analysis
Request: { "proposalText": "..." }
Response: {
  "summary": "2-sentence executive summary",
  "riskLevel": "Low|Medium|High|Critical",
  "riskAnalysis": "Technical risk justification",
  "strategyMatchScore": 0-100,  // vs user's strategy
  "strategyReasoning": "Why it fits/doesn't fit",
  "recommendation": "For|Against|Abstain",
  "securityChecks": [
    { "name": "Contract Scan", "status": "pass|warning|fail", "details": "..." },
    { "name": "Treasury Impact", "status": "...", "details": "..." }
  ],
  "keyPoints": ["...", "...", "..."]
}
```

**2. Chat Assistant**
```typescript
POST /api/chat
Request: {
  "history": [
    { "role": "user", "content": "What's the risk?" },
    { "role": "agent", "content": "..." }
  ],
  "context": "Full proposal text"
}
Response: { "message": "AI response" }
```

#### Prompting Strategy
```
System Prompt:
"You are VoteNow, an autonomous DAO Governance Agent.
User Strategy: [Conservative/Balanced/Aggressive Growth]
Holdings: [User's token portfolio]"

User Prompt:
"Analyze this proposal: [4000 chars max]
Output valid JSON with: {summary, riskLevel, ...}"

Temperature: 0.3 (consistent, focused)
JSON Mode: Enabled (structured output)
```

#### AI Cost Analysis
**Per Analysis**:
- Input: ~2000 tokens (proposal text)
- Output: ~500 tokens (JSON response)
- Cost: $0.00068 per analysis

**At Scale** (10K analyses/day):
- Daily: $6.80
- Monthly: $204
- Annual: $2,448

**Compare to GPT-4**: $49K/year (20x more expensive)

---

### 🔗 Web3 Infrastructure

#### Blockchain Data Sources
| Service | Purpose | Cost |
|---------|---------|------|
| **Snapshot GraphQL** | Proposal data, vote submission | Free (public API) |
| **Alchemy** | RPC for voting power queries | $200/mo (Growth plan) |
| **Infura** | Backup RPC | Free tier OK |

#### Smart Contract Integrations

**Current (Snapshot Only)**:
- EIP-712 off-chain signatures
- No gas fees, instant votes

**Roadmap (On-Chain Voting)**:
```solidity
// Support for Governor contracts
interface IGovernor {
  function castVote(uint256 proposalId, uint8 support)
  function castVoteWithReason(uint256 proposalId, uint8 support, string reason)
  function getVotes(address account, uint256 blockNumber)
}
```

**Target Governors**:
- Aave Governor V2
- Uniswap Governor Bravo
- Compound Governor
- ENS Governor

#### Voting Flow (Technical)
```
1. User connects wallet
   → wagmi.useConnect() + MetaMask provider

2. User selects vote choice (For/Against/Abstain)
   → React state update

3. Frontend calls useSnapshotVote hook
   → Queries voting power: viem.readContract(tokenAddress, 'balanceOf')
   → Builds EIP-712 message

4. MetaMask signature prompt
   → User signs (off-chain, no gas)
   → Returns signature bytes

5. Submit to Snapshot
   → snapshot.utils.signMessage()
   → POST to hub.snapshot.org/api/msg

6. Backend records vote
   → POST /api/vote
   → Award points (base + bonuses)
   → Update user level/streak

7. UI updates
   → Show "Vote Recorded" confirmation
   → Display points earned
   → Update leaderboard position
```

---

### 📦 Infrastructure & DevOps

#### Local Development
```bash
npm run dev          # Concurrently run frontend + server
npm run dev:frontend # Vite dev server (port 3000)
npm run dev:server   # Hono server (port 3001)
```

#### Production Deployment (Recommended)

**Frontend** (Static Site):
- **Platform**: Vercel, Netlify, Cloudflare Pages
- **Build**: `npm run build` → `dist/` folder
- **CDN**: Automatic (edge caching)
- **Cost**: Free tier OK (<100GB bandwidth)

**Backend** (API):
- **Platform**: Vercel Serverless, Railway, Fly.io
- **Runtime**: Node.js 18+
- **Database**: Supabase (PostgreSQL) or Neon
- **Redis**: Upstash (serverless Redis)
- **Cost**: $20-50/mo

**Domains**:
- votenow.app (main)
- api.votenow.app (backend)

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
on: [push]
jobs:
  test:
    - npm install
    - npm test (75 tests must pass)
  build:
    - npm run build
  deploy:
    - Vercel deploy (auto)
```

#### Monitoring
- **Error Tracking**: Sentry
- **Analytics**: PostHog (privacy-focused)
- **Uptime**: BetterUptime
- **RPC Monitoring**: Alchemy dashboard

---

### 🧪 Testing Strategy

#### Test Coverage (75 Tests)
```
server/src/__tests__/
├── points.test.ts          # 10 tests (point calculation, levels)
├── snapshot.test.ts        # 9 tests (API integration, tiers)
├── dao-manager.test.ts     # 7 tests (DAO CRUD, proposals)
├── rewards.test.ts         # 12 tests (redemption flow)
├── voting.test.ts          # 8 tests (vote recording)
├── llm.test.ts            # 6 tests (AI analysis mocking)
└── integration.test.ts     # 23 tests (full user flows)
```

#### Test Tools
- **Framework**: Vitest (Jest-compatible, 10x faster)
- **Mocking**: vi.mock() for external APIs
- **Coverage**: 90%+ target

#### Test Examples
```typescript
// Point calculation test
test('awards early vote bonus (20%)', () => {
  const tx = awardVotePoints('0x123...', 'prop-1', 'aave.eth', true)
  expect(tx.amount).toBe(120) // 100 base + 20 bonus
})

// AI analysis test
test('returns valid JSON structure', async () => {
  const result = await analyzeProposal('Sample proposal text')
  expect(result).toHaveProperty('riskLevel')
  expect(['Low','Medium','High','Critical']).toContain(result.riskLevel)
})
```

---

### 🔒 Security Considerations

#### Smart Contract Safety
- **No custody**: Never hold user funds
- **EIP-712 only**: Off-chain signatures (no contract risk)
- **Future audits**: Trail of Bits for on-chain voting

#### API Security
- **Rate limiting**: 100 req/min per IP (Hono middleware)
- **CORS**: Whitelist frontend domain only
- **Input validation**: Zod schemas for all endpoints
- **SQL injection**: N/A (in-memory for MVP, parameterized for production)

#### User Privacy
- **No KYC**: Wallet-based auth only
- **Data minimization**: Store wallet address + points only
- **No tracking**: Privacy-first analytics (PostHog)

---

### 📊 Performance Benchmarks

#### Frontend
- **First Load**: <2s (Vite optimized)
- **Hot Reload**: <50ms (Vite HMR)
- **Build Size**: ~200KB gzipped (code splitting)

#### Backend
- **API Latency**: 50-200ms average
  - /api/proposals: 150ms (Snapshot GraphQL)
  - /api/analysis: 3-5s (AI inference)
  - /api/vote: 100ms (in-memory write)

#### AI
- **Analysis Time**: 3-5s (DeepSeek R1)
- **Chat Response**: 1-2s (shorter outputs)

#### Database (Production)
- **PostgreSQL**: <10ms for indexed queries
- **Redis**: <1ms for leaderboard reads

---

### 🚀 Scalability Plan

#### Current Capacity (MVP)
- **Concurrent Users**: 100
- **Votes/Day**: 1,000
- **AI Analyses/Day**: 500

#### Target Capacity (Year 1)
- **Concurrent Users**: 10,000
- **Votes/Day**: 50,000
- **AI Analyses/Day**: 10,000

#### Scaling Strategy
1. **Horizontal Scaling**: Serverless functions (auto-scale)
2. **Database**: Read replicas (3x)
3. **Cache**: Redis cluster
4. **CDN**: Cloudflare for static assets
5. **AI**: Batch processing for non-critical analyses

---

### 🛠️ Developer Experience

#### Quick Start
```bash
git clone https://github.com/yourusername/votenow.git
cd votenow
npm install
cp .env.example .env  # Add DEEPSEEK_API_KEY
npm run dev           # http://localhost:3000
```

#### Code Quality Tools
- **ESLint**: Strict rules (Airbnb config)
- **Prettier**: Auto-formatting
- **TypeScript**: Strict mode
- **Husky**: Pre-commit hooks (lint + test)

#### Documentation
- **API Docs**: OpenAPI 3.0 spec (Swagger UI)
- **Component Docs**: Storybook (roadmap)
- **README**: Comprehensive setup guide

---

## Technology Decisions - Why We Chose This Stack

### Frontend: React + Vite
**Why not Next.js?**
- VoteNow is a SPA (no SEO needs, wallet-gated)
- Vite is faster (50ms HMR vs 500ms)
- Simpler deployment (static site vs server)

### Web3: wagmi + viem
**Why not ethers.js alone?**
- wagmi provides React hooks (useConnect, useAccount)
- viem is 10x faster, TypeScript-native
- Modern stack (2024 standard)

### Backend: Hono
**Why not Express?**
- 3x faster (routing performance)
- Edge-compatible (Cloudflare Workers ready)
- TypeScript-first (no @types packages)

### AI: DeepSeek
**Why not OpenAI GPT-4?**
- 20x cheaper ($0.27/M vs $5/M)
- Comparable quality (MMLU 89.5%)
- OpenAI-compatible API (easy swap if needed)

### Testing: Vitest
**Why not Jest?**
- 10x faster (native ESM support)
- Vite integration (same config)
- Better TypeScript support

---

## Open Source Strategy

### Current Status
- **License**: MIT (planned)
- **Repository**: Private (during seed fundraise)

### Future (Post-Funding)
- **Core Platform**: Open source (frontend + backend)
- **Community Contributions**: DAO-specific modules, AI prompts
- **Monetization**: SaaS features (premium tiers), not core functionality

### Why Open Source?
1. **Trust**: Users verify no malicious code
2. **Community**: Contributors improve AI prompts, add DAOs
3. **Distribution**: Other projects integrate VoteNow (API consumers)

---

## Roadmap: Technology Evolution

### Q2 2026 (Current)
- ✅ MVP stack (React + Hono + DeepSeek)
- ✅ 20 DAOs, 4 chains
- ✅ In-memory storage

### Q3 2026
- 🔄 PostgreSQL + Redis migration
- 🔄 Mobile app (React Native + Expo)
- 🔄 On-chain voting (Governor contracts)
- 🔄 50 DAOs, 7 chains

### Q4 2026
- 📋 GraphQL API (for third-party apps)
- 📋 Custom AI fine-tuning (governance-specific model)
- 📋 White-label solution (DAOs deploy their own VoteNow)

### 2027
- 📋 Self-hosted AI option (privacy for institutions)
- 📋 Vote delegation AI ("auto-vote based on my strategy")
- 📋 DAO SDK (other apps embed VoteNow voting)

---

## Tech Stack Summary

| Layer | Tech | Why |
|-------|------|-----|
| **Frontend** | React 19 + Vite | Fast, modern, Web3-native |
| **Web3** | wagmi + viem + Snapshot | Best-in-class wallet integration |
| **Backend** | Hono + TypeScript | Fast, edge-ready, type-safe |
| **AI** | DeepSeek | Cheapest, high-quality, OpenAI-compatible |
| **Storage** | PostgreSQL + Redis | Reliable, scalable, proven |
| **Deploy** | Vercel + Railway | Serverless, auto-scale, cheap |
| **Testing** | Vitest | Fast, ESM-native |

**Philosophy**: Modern, TypeScript-first, serverless-ready, open-source-friendly.
