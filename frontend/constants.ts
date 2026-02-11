import { Proposal, ProposalStatus } from './types';

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'AIP-42',
    daoName: 'Aave',
    source: 'OnChain',
    title: 'Treasury Swap: USDC to ETH',
    description: 'Proposal to diversify 2M USDC from the ecosystem collector into ETH to hedge against long-term inflation and align with the protocol native asset exposure strategy.',
    fullContent: `
      ## Abstract
      This proposal seeks to authorize the Aave Guardian to swap 2,000,000 USDC held in the Collector contract for ETH via CowSwap.
      
      ## Motivation
      The Aave treasury is currently heavy in stablecoins. With the market conditions stabilizing, it is prudent to hold a portion of the treasury in ETH to capture potential upside and align with the Ethereum ecosystem.
      
      ## Specification
      1. Withdraw 2M USDC from Collector.
      2. Execute swap on CowSwap with max slippage 0.5%.
      3. Return ETH to Collector.
      
      ## Risk Factors
      - Volatility of ETH price could reduce treasury value in USD terms.
      - Smart contract risk during the swap execution.
    `,
    status: ProposalStatus.ACTIVE,
    endDate: '2023-11-15',
    votesFor: 150000,
    votesAgainst: 12000,
    participationRate: 12.5,
    tags: ['Treasury', 'Finance'],
  },
  {
    id: 'UIP-104',
    daoName: 'Uniswap',
    source: 'Snapshot',
    title: 'Activate Fee Switch on Pool #4421',
    description: 'A governance proposal to turn on the protocol fee switch for the DAI/USDC 0.01% pool on Polygon, directing 10% of LP fees to the DAO treasury.',
    fullContent: `
      ## Summary
      This proposal activates the protocol charge for the DAI/USDC 0.01% fee tier on Polygon.
      
      ## Rationale
      The pool has sufficient liquidity and volume. Turning on the fee switch is a test case for revenue generation without significantly impacting LP profitability due to the high volume nature of stable-stable pairs.
      
      ## Technical Implementation
      Call setFeeProtocol(4421, 10) on the Uniswap V3 Factory contract.
    `,
    status: ProposalStatus.ACTIVE,
    endDate: '2023-11-14',
    votesFor: 890000,
    votesAgainst: 910000,
    participationRate: 24.2,
    tags: ['Protocol', 'Fees', 'Polygon'],
  },
  {
    id: 'LIP-88',
    daoName: 'Lido',
    source: 'OnChain',
    title: 'Emergency Security Upgrade',
    description: 'Upgrade the withdrawal queue contract to patch a potential re-entrancy vulnerability discovered during the latest audit by OpenZeppelin.',
    fullContent: `
      ## Security Alert
      A potential vector for re-entrancy was identified in the withdrawal finalization logic. 
      
      ## Action
      Immediate upgrade of the proxy implementation to v2.1.4.
      
      ## Impact
      Withdrawals will be paused for 2 hours during the upgrade. No funds are currently at risk, but this is a preventative measure.
      
      ## Code Changes
      See GitHub PR #442 for the exact diffs. The check-effect-interaction pattern has been enforced strictly in the finalize() function.
    `,
    status: ProposalStatus.ACTIVE,
    endDate: '2023-11-12',
    votesFor: 4000000,
    votesAgainst: 0,
    participationRate: 45.0,
    tags: ['Security', 'Upgrade'],
  }
];
