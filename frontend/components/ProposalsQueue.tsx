import React from 'react';
import { Proposal } from '../types';
import { Filter, ChevronRight, Clock } from 'lucide-react';

interface ProposalsQueueProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
}

const ProposalsQueue: React.FC<ProposalsQueueProps> = ({ proposals, onSelectProposal }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Active Mandates</h2>
          <p className="text-xs text-zinc-500 font-medium">Prioritized by urgency</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 shadow-sm border border-zinc-100 transition-colors">
           <Filter size={16} /> Filter
        </button>
      </div>

      <div className="space-y-3">
         {proposals.map((proposal) => (
            <div 
               key={proposal.id} 
               onClick={() => onSelectProposal(proposal)}
               className="group bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-float transition-all cursor-pointer flex items-center gap-6"
            >
               {/* Icon/Logo Placeholder */}
               <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 flex-shrink-0">
                  {proposal.daoName[0]}
               </div>

               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                     <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                        {proposal.daoName}
                     </span>
                     <span className="text-xs text-zinc-400 font-mono">#{proposal.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                     {proposal.title}
                  </h3>
               </div>

               <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 justify-end mb-1">
                     <Clock size={12} /> {proposal.endDate}
                  </div>
                  <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-zinc-800 rounded-full" 
                        style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }} 
                     />
                  </div>
               </div>

               <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all">
                  <ChevronRight size={16} />
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ProposalsQueue;
