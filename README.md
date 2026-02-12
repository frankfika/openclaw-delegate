# VoteNow

Multi-chain DAO governance aggregator with real Snapshot voting, AI-powered proposal analysis, and a points reward system.

## What It Does

VoteNow aggregates governance proposals from 20+ DAOs across Ethereum, Arbitrum, Optimism, and Polygon. Users connect their wallet, review proposals with AI-assisted analysis, cast real Snapshot votes via MetaMask EIP-712 signing, and earn points redeemable for rewards.

## Features

- **Real Snapshot Voting** — EIP-712 signed votes via MetaMask, real voting power queries, existing vote detection
- **AI Proposal Analysis** — DeepSeek-powered risk assessment, strategy alignment scoring, vote recommendations
- **Points & Rewards** — Earn points per vote (40-100 based on DAO tier), early vote bonuses, streak multipliers, 6-level ranking system, reward marketplace
- **Multi-Chain** — Ethereum, Arbitrum, Optimism, Polygon with chain filtering
- **20+ DAOs** — Aave, Uniswap, Curve, Compound, Arbitrum DAO, Optimism, Lido, ENS, Safe, Gitcoin, and more
- **Leaderboard** — Top voters ranked by points
- **Telegram Bot** — Push notifications for new proposals
- **Chat with Agent** — Ask questions about any proposal in context

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS, Recharts |
| Web3 | wagmi 2, viem 2, ethers 5, @snapshot-labs/snapshot.js |
| Backend | Hono, Node.js, TypeScript |
| AI | DeepSeek via OpenAI SDK |
| Bot | grammy (Telegram) |
| Testing | Vitest (75 tests) |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run both frontend and server
npm run dev
```

Frontend runs at `http://localhost:3000`, API at `http://localhost:3001`.

## Environment Variables

```
DEEPSEEK_API_KEY=       # Required — AI analysis
TELEGRAM_BOT_TOKEN=     # Optional — Telegram notifications
PORT=3001               # Server port
FRONTEND_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev             # Frontend + server in parallel
npm run dev:frontend    # Frontend only (Vite, port 3000)
npm run dev:server      # Server only (Hono, port 3001)
npm run build           # Build frontend for production
npm start               # Start server
npm test                # Run all 75 tests
```

## Project Structure

```
├── frontend/
│   ├── components/        # React components (13)
│   │   ├── Dashboard.tsx        # Main view with metrics
│   │   ├── ProposalDetail.tsx   # Proposal + AI chat panel
│   │   ├── VoteButton.tsx       # Real Snapshot voting
│   │   ├── PointsPanel.tsx      # Points & level display
│   │   ├── Leaderboard.tsx      # Top voters
│   │   ├── RewardsShop.tsx      # Reward marketplace
│   │   ├── ProposalsQueue.tsx   # Filterable proposal list
│   │   └── WalletConnect.tsx    # Multi-chain wallet
│   ├── hooks/
│   │   ├── useSnapshotVote.ts   # Vote lifecycle hook
│   │   ├── useProposals.ts      # Proposal fetching
│   │   └── useWallet.ts         # Wagmi config (5 chains)
│   └── services/
│       ├── api.ts               # Backend API client
│       └── snapshot.ts          # Browser-side Snapshot SDK
│
├── server/
│   ├── src/
│   │   ├── routes/        # API routes (8 modules, 42+ endpoints)
│   │   ├── services/      # Business logic (10 modules)
│   │   │   ├── dao-manager.ts   # Multi-DAO state & proposals
│   │   │   ├── snapshot.ts      # Snapshot GraphQL integration
│   │   │   ├── llm.ts           # DeepSeek AI analysis
│   │   │   ├── points.ts        # Points calculation
│   │   │   ├── rewards.ts       # Reward catalog & redemption
│   │   │   └── voting.ts        # Voting power queries
│   │   └── __tests__/     # 75 tests across 7 files
│   └── package.json
│
└── skills/
    └── dao-governance/    # Agent skill definition
```

## API Endpoints

### Core
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/proposals` | List proposals (filterable by chain, DAO) |
| GET | `/api/daos` | List tracked DAOs |
| POST | `/api/vote` | Record vote + award points |
| POST | `/api/analysis` | AI proposal analysis |
| POST | `/api/chat` | Chat with agent about a proposal |

### Points & Rewards
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/points/:address` | User points balance |
| GET | `/api/leaderboard` | Top voters |
| GET | `/api/rewards` | Available rewards |
| POST | `/api/rewards/:id/redeem` | Redeem reward |
| GET | `/api/users/:id/dashboard` | User dashboard (level, streak, stats) |

### DAOs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/daos/:id` | DAO details with stats |
| GET | `/api/daos/:id/proposals` | Proposals for specific DAO |
| POST | `/api/sync-proposals` | Force sync from Snapshot |

## Points System

| DAO Tier | DAOs | Points/Vote |
|----------|------|-------------|
| Tier 1 | Aave, Uniswap, Curve, Compound | 100 |
| Tier 2 | Arbitrum, Optimism, Stargate, Polygon | 80 |
| Tier 3 | Lido, Balancer, SushiSwap, Hop, 1inch | 60 |
| Tier 4 | ENS, Safe, Gitcoin, The Graph | 60 |
| Tier 5 | ParaSwap, Olympus, ApeCoin | 40 |

Early votes (within 24h) earn a 20% bonus.

**Levels:** Newcomer (0) -> Voter (500) -> Delegate (2k) -> Governor (5k) -> Council (10k) -> DAO Legend (25k)

## How Voting Works

1. Connect wallet via MetaMask/WalletConnect
2. Browse proposals or use chain/DAO filters
3. Open a proposal — AI analysis runs automatically
4. Click vote — MetaMask pops up with EIP-712 signature request
5. Sign (off-chain, no gas) — vote submitted to Snapshot
6. Points awarded based on DAO tier + early vote bonus

## License

MIT
