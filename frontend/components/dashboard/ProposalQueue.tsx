import { ArrowUpRight } from 'lucide-react';
import { Proposal, isSnapshotProposal } from '../../types';
import { getChainName } from '../../../shared/config';

interface ProposalQueueProps {
  proposals: Proposal[];
  onSelect: (proposal: Proposal) => void;
  onViewAll: () => void;
  chainFilter: string;
  onChainFilterChange: (id: string) => void;
  count: number;
}

export function ProposalQueue({
  proposals,
  onSelect,
  onViewAll,
  chainFilter,
  onChainFilterChange,
  count,
}: ProposalQueueProps) {
  return (
    <div className="pt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          Upcoming Queue
          <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs">{count}</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: '1', label: 'ETH' },
              { id: '42161', label: 'ARB' },
              { id: '10', label: 'OP' },
              { id: '137', label: 'MATIC' },
            ].map((cf) => (
              <button
                key={cf.id}
                onClick={() => onChainFilterChange(cf.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  chainFilter === cf.id
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100'
                }`}
              >
                {cf.label}
              </button>
            ))}
          </div>
          <button
            onClick={onViewAll}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full"
          >
            View All
          </button>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 text-zinc-300"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-medium">No additional proposals in queue.</p>
          </div>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar snap-x px-1">
          {proposals.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className="min-w-[320px] bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-center group"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                    isSnapshotProposal(p)
                      ? 'bg-yellow-100/80 text-yellow-700 border-yellow-200'
                      : 'bg-purple-100/80 text-purple-700 border-purple-200'
                  }`}
                >
                  {isSnapshotProposal(p) ? 'Snapshot' : 'OnChain'}
                </span>
                <span className="text-xs font-mono text-zinc-400 bg-white/50 px-2 py-1 rounded-md border border-zinc-100">
                  #{p.displayId || p.id.slice(0, 8)}
                </span>
              </div>

              <h4 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                {p.title}
              </h4>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-5 font-medium">{p.description}</p>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 border border-zinc-200 shadow-inner">
                    {p.daoName[0]}
                  </div>
                  <span className="text-sm font-bold text-zinc-700">{p.daoName}</span>
                </div>
                <span className="text-xs text-zinc-400">
                  {getChainName(isSnapshotProposal(p) ? p.network : String(p.chainId))}
                </span>
              </div>
            </div>
          ))}

          {/* View More Card */}
          <div className="min-w-[120px] flex items-center justify-center">
            <div
              onClick={onViewAll}
              className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-50 hover:scale-110 hover:text-indigo-500 hover:border-indigo-200 transition-all duration-300 group"
            >
              <ArrowUpRight size={24} className="group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
