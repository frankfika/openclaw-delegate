# VoteNow Business Plan
**Multi-Chain DAO Governance Aggregator with AI-Powered Decision Support**

---

## Executive Summary

### Vision
Democratize DAO governance participation by making it accessible, rewarding, and intelligent for every Web3 user.

### Mission
Transform passive token holders into active governance participants through AI-powered insights and gamified incentives.

### The Problem
1. **Governance Fragmentation**: 1000+ DAOs across 50+ chains with no unified interface
2. **Low Participation**: Average DAO voter turnout is 3-10% despite billions in treasuries
3. **Information Overload**: Complex proposals require hours of research to understand
4. **No Incentives**: Voting is time-consuming with no immediate rewards (beyond protocol alignment)

### The Solution: VoteNow
A multi-chain governance aggregator that:
- **Aggregates** proposals from 20+ major DAOs (Aave, Uniswap, Arbitrum, etc.) in one dashboard
- **Analyzes** proposals using AI (DeepSeek) for risk assessment and personalized recommendations
- **Rewards** users with points (40-100 per vote) redeemable for USDC, NFTs, and benefits
- **Simplifies** voting with one-click MetaMask signing (no gas fees, Snapshot integration)

### Market Opportunity
- **Total Addressable Market**: 15M+ DAO token holders globally
- **Current Annual Voting Volume**: 500K+ votes across major DAOs
- **Treasury Value**: $25B+ controlled by top 50 DAOs
- **Projected Growth**: 3x by 2028 as DAOs become standard corporate structure

### Traction (Current MVP)
- 20 integrated DAOs across 4 chains (Ethereum, Arbitrum, Optimism, Polygon)
- Real Snapshot voting with EIP-712 signatures
- 75 passing automated tests
- AI-powered analysis via DeepSeek
- 9 reward items (USDC, ARB tokens, NFT badges)

### Funding Ask & Use
**Seeking**: $500K seed round
- 40% Engineering (mobile app, 50+ DAOs, on-chain voting)
- 30% Rewards Pool (user acquisition via point redemptions)
- 20% Marketing (influencer partnerships, DAO treasury grants)
- 10% Operations

---

## Product Overview

### Core Features

#### 1. Multi-Chain DAO Aggregation
**Current Status**: Live with 20 DAOs
- **Tier 1 DAOs** (100 pts/vote): Aave, Uniswap, Curve, Compound
- **Tier 2 DAOs** (80 pts/vote): Arbitrum, Optimism, Stargate, Polygon
- **Tier 3-5 DAOs** (40-60 pts/vote): Lido, ENS, Gitcoin, 1inch, etc.

**Supported Chains**: Ethereum, Arbitrum, Optimism, Polygon
**Roadmap**: Base, zkSync, Avalanche, BSC (Q2 2026)

#### 2. AI-Powered Proposal Analysis
**Technology**: DeepSeek API (OpenAI-compatible)

**Analysis Features**:
- **Risk Assessment**: Low/Medium/High/Critical ratings
- **Strategy Matching**: 0-100 score vs user's investment strategy (Conservative/Balanced/Aggressive)
- **Security Checks**: Contract scan, treasury impact, governance integrity
- **Recommendation**: For/Against/Abstain with reasoning
- **Executive Summary**: 2-sentence digestible overview
- **Chat Assistant**: Ask questions about any proposal in context

**Sample Output**:
```json
{
  "summary": "Proposes 5% APY increase for stETH. Low execution risk.",
  "riskLevel": "Low",
  "strategyMatchScore": 85,
  "recommendation": "For",
  "securityChecks": [
    {"name": "Contract Scan", "status": "pass"},
    {"name": "Treasury Impact", "status": "warning", "details": "$2M allocation"}
  ]
}
```

#### 3. Gamified Points & Rewards System

**Points Earning**:
- Base Points: 40-100 per vote (tier-based)
- Early Vote Bonus: +20% (within 24 hours)
- Streak Bonus: +5% per consecutive day (max 50%)
- Referral Bonus: 100 points per invited user

**User Levels**:
| Level | Points Required | Title | Perks |
|-------|----------------|-------|-------|
| 1 | 0 | Newcomer | - |
| 2 | 500 | Voter | Leaderboard badge |
| 3 | 2,000 | Delegate | 10% point boost |
| 4 | 5,000 | Governor | Priority support |
| 5 | 10,000 | Council | Early reward access |
| 6 | 25,000 | DAO Legend | Exclusive NFTs, governance power |

**Rewards Catalog**:
- **Tokens**: 10 USDC (1,000 pts), 50 USDC (4,500 pts), 5 ARB (500 pts)
- **NFTs**: Bronze/Silver/Gold Governance Badges (2K-15K pts)
- **Benefits**: Gas vouchers (300 pts), premium membership (1,500 pts)

#### 4. Real Snapshot Voting
**Integration**: @snapshot-labs/snapshot.js + ethers.js

**Voting Flow**:
1. User connects wallet (wagmi + viem)
2. Selects proposal choice
3. MetaMask prompts EIP-712 signature (off-chain, no gas)
4. Vote submitted to Snapshot hub
5. Points instantly awarded

**Features**:
- Voting power query (user's token balance at snapshot block)
- Existing vote detection (prevents double-voting)
- Vote verification (on-chain proof)

#### 5. Social & Engagement
- **Leaderboard**: Top 100 voters by total points
- **Telegram Bot**: Notifications for new proposals (grammy framework)
- **Referral System**: Share link, earn points when friends vote
- **DAO Activity Feed**: Real-time vote events

---

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 19 + Vite 6 | Fast SPA with hot reload |
| Styling | Tailwind CSS | Responsive, accessible UI |
| Charts | Recharts | Proposal analytics, leaderboard graphs |
| Web3 | wagmi 2 + viem 2 | Wallet connection, multi-chain support |
| Snapshot | @snapshot-labs/snapshot.js | Off-chain voting |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| API | Hono (Node.js) | Fast edge-compatible API framework |
| Language | TypeScript | Type safety, better DX |
| Storage | In-memory (MVP) → PostgreSQL + Redis (Prod) | User points, votes, rewards |
| Testing | Vitest | 75 tests across 7 modules |

### Web3 Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Voting | Snapshot GraphQL API | Fetch proposals, submit votes |
| Signatures | EIP-712 | Off-chain vote signing |
| Chains | Ethereum, Arbitrum, Optimism, Polygon | Multi-chain DAO support |
| RPC | Alchemy/Infura | Blockchain data queries |
| Wallet | MetaMask, WalletConnect | User authentication |

### AI Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| LLM | DeepSeek (R1/Chat) | Proposal analysis, chat assistant |
| API | OpenAI SDK (compatible) | Unified interface |
| Prompting | Chain-of-thought, JSON mode | Structured analysis output |
| Context | 32K tokens | Analyze full proposal text |
| Features | Risk scoring, strategy matching, security audit | Decision support |

**AI Differentiation**:
- **Cost**: DeepSeek is 10-20x cheaper than GPT-4 ($0.27/M tokens vs $5/M)
- **Speed**: 30 tokens/sec, 3-5s for full analysis
- **Quality**: Comparable to GPT-4 on reasoning tasks (MMLU 89.5%)
- **Privacy**: Self-hosted option available (future)

---

## Market Analysis

### Target Audiences

#### 1. Passive Token Holders (Primary)
**Size**: 12M+ users holding governance tokens
**Pain Points**:
- Own tokens but never voted (90%+ of holders)
- Don't know when/where proposals happen
- Don't understand complex governance proposals
- No immediate incentive to participate

**VoteNow Solution**:
- One dashboard for all their DAOs
- AI explains every proposal in plain English
- Earn rewards (USDC, NFTs) for participating

#### 2. Active DAO Contributors (Secondary)
**Size**: 500K+ engaged governance participants
**Pain Points**:
- Managing votes across 5-10 DAOs manually
- Spending hours researching each proposal
- Switching between Discord, forums, Snapshot

**VoteNow Solution**:
- Unified workflow, save 10+ hours/month
- AI research assistant for quick due diligence
- Points boost for being power users

#### 3. Governance Delegates (Tertiary)
**Size**: 50K+ professional delegates
**Pain Points**:
- Managing votes for 100+ delegators
- Providing transparent reasoning for votes
- Building reputation across DAOs

**VoteNow Solution**:
- Delegate dashboard (roadmap)
- Auto-generate vote rationales with AI
- Leaderboard establishes credibility

### Competitive Landscape

| Competitor | Strengths | Weaknesses | VoteNow Advantage |
|------------|-----------|------------|-------------------|
| **Snapshot** | Industry standard, trusted | No aggregation, no analysis, no rewards | Multi-DAO view + AI + gamification |
| **Tally** | On-chain governance focus | Only on-chain (misses 80% of votes), no AI | Snapshot support + AI insights |
| **Boardroom** | Good DAO data aggregation | No voting, no rewards, outdated UI | Native voting + rewards system |
| **DeepDAO** | Comprehensive DAO analytics | Analytics-only, no participation tools | Integrated voting flow |
| **Karma** | Delegate reputation scoring | Delegate-focused, not retail-friendly | Points system for all users |

**Unique Positioning**:
"The only platform that lets you vote on 50+ DAOs in one click, get AI recommendations, and earn real rewards."

### Market Trends

1. **DAO Growth**: 15,000+ DAOs created (2024), up from 3,000 (2022)
2. **Treasury Expansion**: Top 50 DAOs control $25B+ (3x from 2023)
3. **Governance as a Service**: Emerging category (delegation, tooling, analytics)
4. **AI in Web3**: 60% of protocols exploring AI integration (2025 survey)
5. **Gamification**: Points/rewards systems driving 40% higher engagement (see friend.tech, Blast)

---

## Business Model

### Revenue Streams

#### 1. Platform Fees (Primary - Launch Q3 2026)
**Model**: 5% fee on reward redemptions
- User redeems 1,000 points → 10 USDC reward
- Platform keeps 0.5 USDC (5%)
- **Projected Revenue**: $50K/month @ 10K active users (assuming 50% redeem monthly)

#### 2. Premium Subscriptions (Secondary - Q4 2026)
**Tiers**:
- **Free**: 20 DAOs, basic AI analysis, 100 pts/month cap
- **Pro ($9/month)**: 50 DAOs, advanced AI chat, 500 pts/month cap, priority support
- **Delegate ($49/month)**: Unlimited DAOs, bulk voting, custom strategies, analytics dashboard

**Projected Revenue**: $30K/month @ 1K Pro + 100 Delegate users

#### 3. DAO Partnership Grants (Current - Pilot)
**Model**: DAOs pay VoteNow to boost their proposal visibility
- Featured placement in feed ($1K-5K per proposal)
- Targeted notifications to high-level voters
- Custom AI analysis aligned with DAO's messaging

**Pilot Partners**: Targeting Arbitrum DAO, Gitcoin, Optimism Collective
**Projected Revenue**: $20K/month @ 5 partners

#### 4. Data & Analytics API (Future - 2027)
**Model**: Sell aggregated governance data to:
- DAO tooling companies (Tally, Boardroom)
- Research firms (Messari, Delphi Digital)
- Institutional investors

**Pricing**: $500-5K/month per customer
**Projected Revenue**: $15K/month @ 10 customers

#### 5. Affiliate & Referrals (Passive)
**Partnerships**:
- Wallet providers (MetaMask, Rabby): $5 per new voter
- DeFi protocols: Earn APY boost for voters (e.g., Aave stakers)

**Projected Revenue**: $5K/month

### Unit Economics (Year 1 Projections)

**Assumptions**:
- 10,000 monthly active voters
- Average 5 votes per user per month
- 50% redemption rate
- $2 value per 1,000 points (market rate)

**Revenue**:
- Platform fees: $50K (5% of $1M redemptions)
- Subscriptions: $30K (1,100 paid users)
- DAO grants: $20K (5 partners)
- Total: $100K/month = $1.2M/year

**Costs**:
- Rewards pool: $950K/year (user payouts)
- Engineering: $240K (2 full-time devs)
- AI API: $12K (DeepSeek at scale)
- Infrastructure: $24K (hosting, RPC)
- Marketing: $120K
- Total: $1.35M/year

**Year 1 Net**: -$150K (expected for growth phase)

**Break-even**: Year 2 at 30K MAU

---

## Go-to-Market Strategy

### Phase 1: Community Launch (Q2 2026)
**Goal**: 1,000 early adopters, validate product-market fit

**Tactics**:
1. **DAO Forum Campaigns**: Post on Aave, Uniswap, Arbitrum governance forums
   - Offer: "Vote on our DAO + 5 others, earn rewards"
   - Incentive: 2x points for early users (limited time)

2. **Twitter/X KOL Partnerships**: Partner with 10 governance influencers
   - Reach: 50K-200K followers each
   - Offer: Custom referral codes, affiliate revenue share

3. **Snapshot Integration**: Get listed in Snapshot's "Recommended Tools"
   - Traffic: 50K+ monthly governance voters see VoteNow

4. **Airdrop for Power Voters**:
   - Snapshot wallet addresses with 10+ votes in 2025
   - Airdrop: 500 points + Gold NFT badge
   - Target: 5,000 wallets = instant credibility

### Phase 2: Scale with Grants (Q3 2026)
**Goal**: 10,000 MAU, secure 5 DAO partnerships

**Tactics**:
1. **Apply for DAO Grants**: Submit proposals to 10 DAOs
   - Arbitrum: $200K grants for governance tools
   - Optimism: RetroPGF (public goods funding)
   - Gitcoin: Community rounds
   - Pitch: "Increase your voter turnout by 50%"

2. **Paid Marketing**:
   - Twitter Ads: Target followers of @SnapshotLabs, @vitalik.eth
   - Google Search: "DAO voting", "Snapshot alternative"
   - Budget: $50K for 6 months

3. **Referral Program**:
   - Give 100 points to referrer + referee
   - Viral loop: Each user brings 1.5 friends (40% viral coefficient)

### Phase 3: Mainstream Expansion (Q4 2026)
**Goal**: 50,000 MAU, become #1 governance aggregator

**Tactics**:
1. **Mobile App**: iOS + Android (React Native)
   - Push notifications for new proposals
   - Biometric wallet login (no seed phrases)

2. **Institutional Partnerships**:
   - Integrate with Coinbase Wallet, MetaMask
   - Pre-install VoteNow in wallet dApps browser

3. **Educational Content**:
   - YouTube series: "DAO Proposal Breakdown" (partner with Bankless)
   - Blog: SEO-optimized guides (e.g., "How to Vote on Uniswap")

---

## Competitive Advantages

### 1. AI-First Approach
**Moat**: Proprietary prompt engineering + user strategy profiles
- Competitors: Basic proposal summaries (if any)
- VoteNow: Personalized risk/reward analysis, chat-based research

**Barrier to Entry**:
- 6 months of prompt tuning for governance-specific use cases
- User strategy data (Conservative/Balanced/Aggressive) → better recommendations over time

### 2. Gamification & Rewards
**Moat**: Liquidity pool for rewards (USDC, tokens, NFTs)
- Competitors: No direct incentives (only protocol alignment)
- VoteNow: Immediate gratification → higher retention

**Network Effects**:
- More voters → larger rewards pool → attracts more voters
- Leaderboard prestige → social proof → community growth

### 3. Multi-Chain from Day 1
**Moat**: 20+ DAOs across 4 chains (live MVP)
- Competitors: Single-chain focus (e.g., Tally = Ethereum only)
- VoteNow: Full Web3 ecosystem coverage

**Scalability**: Architecture designed for 100+ DAOs, 20+ chains

### 4. Developer-Friendly Architecture
**Open Source Strategy** (Planned Q3 2026):
- Frontend components → Community builds integrations (e.g., Discord bots)
- API → Third-party apps can build on VoteNow data
- Skills framework → AI agents can trigger votes

**Community Contributions**:
- DAO-specific analysis modules (e.g., Curve specialist)
- New reward integrations (e.g., NFT marketplaces)

---

## Product Roadmap

### Q2 2026 (Current - MVP Launch)
- ✅ 20 DAOs across 4 chains
- ✅ AI-powered proposal analysis
- ✅ Points & rewards system (9 items)
- ✅ Real Snapshot voting
- ✅ Leaderboard & user profiles
- 🔄 Telegram bot (90% done)
- 🔄 Referral system

### Q3 2026 (Scale)
- [ ] 50 DAOs (add Base, zkSync, Avalanche)
- [ ] On-chain voting (Governor contracts)
- [ ] Mobile app (iOS + Android)
- [ ] Advanced analytics dashboard
- [ ] Delegate profiles & tracking
- [ ] Multi-language support (Mandarin, Spanish)
- [ ] DAO grant applications (Arbitrum, Optimism)

### Q4 2026 (Monetization)
- [ ] Premium subscriptions launch
- [ ] Platform fees (5% on redemptions)
- [ ] Sponsored proposals (DAO partnerships)
- [ ] Custom user strategies (DeFi, NFT, Social DAOs)
- [ ] Bulk voting for delegates
- [ ] White-label solution for DAOs

### 2027 (Expansion)
- [ ] 200+ DAOs
- [ ] AI-powered vote delegation ("auto-vote based on my strategy")
- [ ] Governance data API (B2B product)
- [ ] VoteNow DAO launch (community governance)
- [ ] Vote escrow (veVOTE) tokenomics
- [ ] Cross-DAO proposal aggregation (e.g., "Vote on all DeFi DAOs at once")

---

## Financial Projections

### Key Assumptions
- **User Growth**: 1K (Q2) → 10K (Q3) → 50K (Q4) → 200K (2027)
- **Engagement**: 5 votes/user/month average
- **Redemption Rate**: 50% of earned points redeemed
- **Platform Fee**: 5% on all redemptions
- **Premium Conversion**: 10% of active users

### Revenue Forecast (3 Years)

| Metric | 2026 (6mo) | 2027 | 2028 |
|--------|-----------|------|------|
| **Monthly Active Users** | 10,000 | 100,000 | 500,000 |
| **Platform Fees** | $150K | $2.4M | $15M |
| **Subscriptions** | $90K | $1.2M | $6M |
| **DAO Grants** | $60K | $500K | $1M |
| **Affiliate Revenue** | $15K | $200K | $800K |
| **Total Revenue** | $315K | $4.3M | $22.8M |

### Cost Structure

| Category | 2026 | 2027 | 2028 |
|----------|------|------|------|
| **Engineering (4 → 8 → 15 devs)** | $240K | $960K | $2.25M |
| **Rewards Pool** | $950K | $3M | $8M |
| **AI API Costs** | $12K | $120K | $600K |
| **Infrastructure** | $24K | $200K | $800K |
| **Marketing** | $120K | $600K | $2M |
| **Operations** | $50K | $300K | $1M |
| **Total Costs** | $1.4M | $5.18M | $14.65M |

### Profitability

| Metric | 2026 | 2027 | 2028 |
|--------|------|------|------|
| **Revenue** | $315K | $4.3M | $22.8M |
| **Costs** | $1.4M | $5.18M | $14.65M |
| **Net Profit** | -$1.1M | -$880K | +$8.15M |
| **Cash Burn Rate** | $183K/mo | $73K/mo | Profitable |

**Break-even**: Q2 2028 at 350K MAU

---

## Risk Analysis & Mitigation

### Technical Risks

#### 1. Snapshot API Reliability
**Risk**: Snapshot goes down, voting fails
**Mitigation**:
- Cache proposals locally (24hr sync)
- Fallback to direct GraphQL queries
- On-chain voting as backup (Governor contracts)

#### 2. AI Hallucination/Bias
**Risk**: DeepSeek gives wrong analysis, users vote incorrectly
**Mitigation**:
- Disclaimer: "AI is advisory only, DYOR"
- Human review for high-stakes proposals (>$10M impact)
- Community flagging system (report bad analysis)
- A/B test AI models (DeepSeek vs GPT-4)

#### 3. Smart Contract Exploits (Future On-Chain Voting)
**Risk**: Vote transaction drains user wallet
**Mitigation**:
- Audits by Trail of Bits, OpenZeppelin
- Bug bounty program ($50K-500K)
- Transaction simulation before signing (Tenderly)

### Business Risks

#### 1. Low User Adoption
**Risk**: Users don't care about governance, points not motivating
**Mitigation**:
- Pivot rewards to higher-value items (e.g., exclusive NFTs, token airdrops)
- Partner with DAOs for co-marketing (e.g., Uniswap endorsement)
- Add social features (vote with friends, DAO clubs)

#### 2. Regulatory Uncertainty
**Risk**: SEC classifies governance tokens as securities, restricts voting
**Mitigation**:
- Legal counsel (crypto-native law firm)
- No custody of user funds (non-custodial rewards)
- Geofence US users if needed (VPN detection)

#### 3. Competitor Copy
**Risk**: Snapshot/Tally adds AI + rewards features
**Mitigation**:
- Build brand loyalty (community-first, DAO governance)
- Network effects (more users = better AI training data)
- Move faster (ship new DAOs weekly)

### Market Risks

#### 1. Crypto Bear Market
**Risk**: DAO participation drops, revenue falls
**Mitigation**:
- Diversify revenue (grants, subscriptions, not just fees)
- Focus on high-conviction DAOs (Ethereum, Uniswap)
- Cut costs (AI efficiency, fewer hires)

#### 2. DAO Governance Centralization
**Risk**: DAOs move to foundation-led governance (less voting)
**Mitigation**:
- Target permissionless DAOs (DeFi, not corporate)
- Offer delegate services (institutions vote for users)
- Expand to other use cases (community polls, DAOs beyond crypto)

---

## Team & Advisors

### Founding Team (Recommended Hires)

#### CEO/Co-Founder (Product & Strategy)
**Background**: Ex-governance lead at major DAO (Uniswap, Compound)
**Skills**: Community building, tokenomics, fundraising

#### CTO/Co-Founder (Engineering)
**Background**: Senior engineer at Web3 company (Coinbase, Alchemy)
**Skills**: Full-stack TypeScript, smart contracts (Solidity), scalability

#### Head of AI (Advisory/Part-Time)
**Background**: ML engineer at AI lab (OpenAI, Anthropic, DeepMind)
**Skills**: LLM fine-tuning, prompt engineering, evaluation

### Advisors (Target List)

1. **Governance Expert**: Former Snapshot founder/core team
2. **DAO Operator**: Gitcoin/MolochDAO/MetaCartel lead
3. **AI Researcher**: Stanford/MIT professor specializing in LLMs
4. **Crypto VC**: Partner at Paradigm, a16z, or Dragonfly

---

## Funding & Use of Funds

### Seed Round: $500K (Q2 2026)
**Valuation**: $3M post-money (negotiable)
**Investors**: Crypto VCs (Dragonfly, Lattice, 1kx), angel investors

### Use of Funds (12-month runway)

| Category | Amount | % | Purpose |
|----------|--------|---|---------|
| **Engineering** | $200K | 40% | 2 full-time devs (mobile app, 50 DAOs, on-chain voting) |
| **Rewards Pool** | $150K | 30% | Bootstrap user acquisition (10K users @ $15 lifetime value) |
| **Marketing** | $100K | 20% | Influencer partnerships, Twitter ads, DAO grants outreach |
| **Operations** | $50K | 10% | Legal, accounting, infrastructure (AWS, Alchemy RPC) |

### Milestones to Unlock Funding

**Tranche 1 ($250K)**: Upon signing
- Deliverable: 50 DAOs, mobile app beta, 1K MAU

**Tranche 2 ($250K)**: After 6 months
- Deliverable: 10K MAU, $50K MRR, 1 DAO partnership

---

## Conclusion

VoteNow is positioned to become the **Robinhood of DAO governance** — making participation accessible, rewarding, and intelligent for millions of token holders.

### Why Now?
1. **Governance is broken**: <5% turnout despite $25B+ in DAO treasuries
2. **AI is mature**: LLMs can now parse complex proposals (2024 breakthrough)
3. **Points systems work**: Proven retention (friend.tech, Blast, EigenLayer)

### Why Us?
1. **Working MVP**: 20 DAOs, real voting, AI analysis, 75 tests passing
2. **Technical Moat**: Multi-chain + AI + gamification (no competitor has all 3)
3. **Timing**: First mover in "governance-as-a-service" category

### The Ask
$500K to scale from 1K → 50K users in 12 months, proving out the business model and securing DAO partnerships.

---

## Appendix

### Tech Architecture Diagram
```
┌─────────────┐
│   Users     │ (MetaMask, WalletConnect)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - Dashboard, ProposalDetail, VoteButton│
│  - wagmi/viem (wallet), Recharts (viz)  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│       Backend API (Hono/Node.js)        │
│  Routes:                                │
│  - /api/proposals (fetch from Snapshot) │
│  - /api/vote (submit + award points)    │
│  - /api/analysis (AI call to DeepSeek)  │
│  - /api/rewards (catalog + redemption)  │
└──────┬──────────────┬──────────────┬────┘
       │              │              │
       ▼              ▼              ▼
┌───────────┐  ┌────────────┐  ┌──────────┐
│ Snapshot  │  │  DeepSeek  │  │PostgreSQL│
│  GraphQL  │  │   AI API   │  │   (DB)   │
│   Hub     │  │  (Analysis)│  │ (Points, │
│ (Voting)  │  │            │  │  Votes)  │
└───────────┘  └────────────┘  └──────────┘
```

### AI Prompting Strategy
```
System: "You are VoteNow, an autonomous DAO Governance Agent."
User Strategy: "Conservative Growth, holds significant ETH"

Proposal: [Full proposal text, max 4,000 chars]

Output JSON:
{
  "summary": "...",
  "riskLevel": "Low|Medium|High|Critical",
  "strategyMatchScore": 0-100,
  "recommendation": "For|Against|Abstain",
  "securityChecks": [...],
  "keyPoints": [...]
}
```

### Rewards Pool Economics
**Bootstrap Phase** (Year 1):
- 1M points distributed = $2,000 in USDC redemptions (at 500 pts = $1 rate)
- Platform takes 5% fee = $100
- Net cost: $1,900 (customer acquisition cost)
- If LTV = $5/user (from fees + subs), ROI = 2.6x

**Steady State** (Year 3):
- 100M points distributed = $200K in redemptions
- Platform fee = $10K
- Net cost: $190K/month
- Revenue from same cohort: $300K (fees + subs)
- **Profitable**: $110K margin

---

**Contact**: [Your Email]
**Demo**: https://votenow.app (placeholder)
**Deck**: [Link to pitch deck]
