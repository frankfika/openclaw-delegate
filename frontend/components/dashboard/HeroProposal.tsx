import { useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { Proposal, isSnapshotProposal } from '../../types';
import { getChainName } from '../../../shared/config';

interface HeroProposalProps {
  proposal: Proposal | null;
  isConnected: boolean;
  userChainId?: string;
  onSelect: (proposal: Proposal) => void;
  onDismiss: () => void;
}

export function HeroProposal({
  proposal,
  isConnected,
  userChainId,
  onSelect,
  onDismiss,
}: HeroProposalProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!proposal) {
    return (
      <div className="col-span-1 md:col-span-2 row-span-2 flex flex-col items-center justify-center h-full text-zinc-400 gap-4 p-8 bg-gradient-to-b from-white to-zinc-50 border border-white/80 rounded-[2.5rem]">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-300"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-bold text-zinc-500 mb-1">No Active Proposals</p>
          <p className="text-sm text-zinc-400">Proposals from tracked DAOs will appear here.</p>
        </div>
      </div>
    );
  }

  const network = isSnapshotProposal(proposal) ? proposal.network : String(proposal.chainId);
  const isOnUserChain = isConnected && userChainId === network;

  return (
    <div
      className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-b from-white to-zinc-50 border border-white/80 rounded-[2.5rem] p-0 shadow-float overflow-hidden flex flex-col group hover:ring-2 hover:ring-indigo-500/20 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-7 pb-2 relative z-10">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            {isOnUserChain ? 'On Your Chain' : 'Critical Priority'}
          </span>

          {/* Network Badge */}
          <span
            className={`text-xs font-bold px-2 py-1 rounded-lg border ${
              isOnUserChain
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            {getChainName(network)}
          </span>

          {/* DAO Badge */}
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg">
            {proposal.daoName}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {proposal.title}
        </h3>
        <p className="text-zinc-500 line-clamp-2 leading-relaxed font-medium text-sm">
          {proposal.description}
        </p>
      </div>

      <div className="mt-auto p-5 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => onSelect(proposal)}
            className="flex-1 relative overflow-hidden bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-zinc-900/20 group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] w-full h-full transform" />
            <span className="flex items-center justify-center gap-2">
              Review & Sign <Sparkles size={14} />
            </span>
          </button>
          <button
            onClick={onDismiss}
            className="px-5 py-3.5 bg-white text-zinc-600 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
