import { useState, useMemo, useCallback, useEffect } from 'react';
import { Proposal, isSnapshotProposal } from '../types';
import { useWallet } from '../hooks/useWallet';
import PointsPanel from './PointsPanel';
import Leaderboard from './Leaderboard';

import {
  StatsCards,
  HeroProposal,
  ProposalQueue,
  QuickStartGuide,
  WalletConnectBanner,
  ChainFilters,
  DaoFilter,
} from './dashboard/index';

interface DashboardProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
  onChangeView?: (view: string) => void;
}

export default function Dashboard({
  proposals,
  onSelectProposal,
  onChangeView,
}: DashboardProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [chainFilter, setChainFilter] = useState('all');
  const [daoFilter, setDaoFilter] = useState('all');
  const { isConnected, chain } = useWallet();

  const userChainId = chain?.id.toString();

  // Get unique DAOs for filter (filtered by selected chain)
  const uniqueDAOsList = useMemo(() => {
    // First filter by chain if selected
    const chainFiltered = chainFilter === 'all'
      ? proposals
      : proposals.filter((p) => {
          const proposalChain = isSnapshotProposal(p) ? p.network : String(p.chainId);
          return proposalChain === chainFilter;
        });
    // Then extract unique DAO names
    return Array.from(new Set(chainFiltered.map((p) => p.daoName))).sort();
  }, [proposals, chainFilter]);

  // Filter proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (chainFilter !== 'all') {
        const proposalChain = isSnapshotProposal(p)
          ? p.network
          : String(p.chainId);
        if (proposalChain !== chainFilter) return false;
      }
      if (daoFilter !== 'all' && p.daoName !== daoFilter) return false;
      return true;
    });
  }, [proposals, chainFilter, daoFilter]);

  // Compute stats
  const stats = useMemo(() => {
    const uniqueDAOs = new Set(filteredProposals.map((p) => p.daoName)).size;
    const totalVotes = filteredProposals.reduce((sum, p) => {
      if (isSnapshotProposal(p)) {
        return sum + p.scoresTotal;
      }
      return sum + p.votesFor + p.votesAgainst;
    }, 0);

    const activityData =
      filteredProposals.length > 0
        ? filteredProposals.slice(0, 7).map((p) => ({
            name: p.daoName.slice(0, 3),
            value: isSnapshotProposal(p)
              ? p.voteCount
              : p.votesFor + p.votesAgainst,
          }))
        : [
            { name: '-', value: 0 },
            { name: '-', value: 0 },
            { name: '-', value: 0 },
          ];

    return {
      uniqueDAOs,
      totalVotes,
      activeProposals: filteredProposals.length,
      activityData,
    };
  }, [filteredProposals]);

  // Get hero proposal
  const heroProposal = useMemo(() => {
    const eligible = filteredProposals.filter((p) => !dismissedIds.has(p.id));
    if (!isConnected || !userChainId) return eligible[0] || null;

    const onUserChain = eligible.filter((p) => {
      const chain = isSnapshotProposal(p) ? p.network : String(p.chainId);
      return chain === userChainId;
    });

    return onUserChain[0] || eligible[0] || null;
  }, [filteredProposals, dismissedIds, isConnected, userChainId]);

  // Get queue proposals
  const queueProposals = useMemo(() => {
    const heroId = heroProposal?.id;
    return filteredProposals.filter((p) => p.id !== heroId);
  }, [filteredProposals, heroProposal]);

  const handleDismiss = useCallback(() => {
    if (heroProposal) {
      setDismissedIds((prev) => new Set(prev).add(heroProposal.id));
    }
  }, [heroProposal]);

  // Reset DAO filter when chain changes and current DAO is not in the new list
  useEffect(() => {
    if (daoFilter !== 'all' && !uniqueDAOsList.includes(daoFilter)) {
      setDaoFilter('all');
    }
  }, [uniqueDAOsList, daoFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="animate-in slide-in-from-left-4 fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Good morning, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-shimmer bg-[length:200%_100%]">
              Commander.
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 animate-in slide-in-from-right-4 fade-in duration-700 delay-100">
          <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Nominal
          </div>
          <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm text-sm font-semibold text-zinc-600">
            {stats.activeProposals} Active
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <QuickStartGuide />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <ChainFilters value={chainFilter} onChange={setChainFilter} />
        <DaoFilter value={daoFilter} onChange={setDaoFilter} daos={uniqueDAOsList} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)]">
        <StatsCards
          totalVotes={stats.totalVotes}
          activeProposals={stats.activeProposals}
          uniqueDAOs={stats.uniqueDAOs}
          activityData={stats.activityData}
        />
        <HeroProposal
          proposal={heroProposal}
          isConnected={isConnected}
          userChainId={userChainId}
          onSelect={onSelectProposal}
          onDismiss={handleDismiss}
        />
      </div>

      {/* Proposal Queue */}
      <ProposalQueue
        proposals={queueProposals}
        onSelect={onSelectProposal}
        onViewAll={() => onChangeView?.('proposals')}
        chainFilter={chainFilter}
        onChainFilterChange={setChainFilter}
        count={queueProposals.length}
      />

      {/* Points & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {isConnected ? (
          <>
            <PointsPanel />
            <Leaderboard />
          </>
        ) : (
          <WalletConnectBanner />
        )}
      </div>
    </div>
  );
}
