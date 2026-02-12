import React, { useState, useEffect } from 'react';
import { Proposal } from '../types';
import { ArrowUpRight, Check, Flame, Box, ShieldCheck, Activity, Sparkles, Inbox } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import PointsPanel from './PointsPanel';
import Leaderboard from './Leaderboard';

interface DashboardProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
  onChangeView?: (view: string) => void;
}

// Animated Number Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (easeOutExpo)
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

      setCount(Math.floor(end * ease));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const CHAIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '1', label: 'Ethereum' },
  { id: '42161', label: 'Arbitrum' },
  { id: '10', label: 'Optimism' },
  { id: '137', label: 'Polygon' },
];

const Dashboard: React.FC<DashboardProps> = ({ proposals, onSelectProposal, onChangeView }) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [chainFilter, setChainFilter] = useState('all');

  // Compute dynamic stats from real proposals
  const uniqueDAOs = new Set(proposals.map(p => p.daoName)).size;
  const totalVotes = proposals.reduce((sum, p) => sum + p.votesFor + p.votesAgainst, 0);
  const activeProposals = proposals.length;
  const queueCount = Math.max(0, proposals.length - 1);

  // Generate activity data from proposals
  const activityData = proposals.length > 0
    ? proposals.slice(0, 7).map((p, i) => ({
        name: p.daoName.slice(0, 3),
        value: p.votesFor + p.votesAgainst,
      }))
    : [
        { name: '-', value: 0 },
        { name: '-', value: 0 },
        { name: '-', value: 0 },
      ];

  const firstProposal = proposals[0];
  const isDismissed = firstProposal ? dismissedIds.has(firstProposal.id) : true;

  const handleDismiss = () => {
    if (firstProposal) {
      setDismissedIds(prev => new Set(prev).add(firstProposal.id));
    }
  };

  // Get the next non-dismissed proposal for the hero card
  const heroProposal = proposals.find(p => !dismissedIds.has(p.id));

  return (
    <div className="space-y-8">

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
         <div className="animate-in slide-in-from-left-4 fade-in duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
               Good morning, <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-shimmer bg-[length:200%_100%]">Commander.</span>
            </h1>
         </div>
         <div className="flex items-center gap-3 animate-in slide-in-from-right-4 fade-in duration-700 delay-100">
             <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm flex items-center gap-2 text-sm font-semibold text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Nominal
             </div>
             <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm text-sm font-semibold text-zinc-600">
                {activeProposals} Active
             </div>
         </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)]">

         {/* 1. Large Hero Card: Platform Stats */}
         <div className="col-span-1 md:col-span-2 row-span-2 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl transition-all hover:scale-[1.01] duration-500 hover:shadow-2xl">
            {/* Subtle Gradient Mesh */}
            <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-indigo-600/30 rounded-full blur-[100px] group-hover:bg-indigo-600/40 transition-colors duration-500"></div>
            <div className="absolute bottom-[-50%] left-[-50%] w-[100%] h-[100%] bg-violet-600/20 rounded-full blur-[100px] group-hover:bg-violet-600/30 transition-colors duration-500"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 shadow-inner-light">
                     Total Votes Tracked
                  </div>
                  <div className="p-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                     <ShieldCheck size={24} className="text-zinc-300 group-hover:text-white transition-colors" />
                  </div>
               </div>

               <div>
                  <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-4 tabular-nums">
                     <AnimatedCounter end={totalVotes} />
                  </h2>
                  <div className="flex items-center gap-4">
                     <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 backdrop-blur-md border border-emerald-500/10">
                        <ArrowUpRight size={16} /> {activeProposals} proposals
                     </span>
                     <span className="text-zinc-400 font-medium tracking-wide">across {uniqueDAOs} DAOs</span>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Participation Chart (Small) */}
         <div className="col-span-1 md:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
               <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-500" /> Activity Pulse
               </h3>
            </div>
            <div className="absolute inset-0 top-10 left-0 right-0 bottom-0 opacity-80">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVal)"
                     />
                     <Tooltip
                        cursor={false}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 3. High Priority Item (Tall) -- with empty state protection */}
         <div className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-b from-white to-zinc-50 border border-white/80 rounded-[2.5rem] p-0 shadow-float overflow-hidden flex flex-col group hover:ring-2 hover:ring-indigo-500/20 transition-all">
            {heroProposal ? (
              <>
                <div className="p-7 pb-2 relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-orange-50 rounded-lg">
                        <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" />
                      </div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Critical Priority</span>
                   </div>
                   <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                      {heroProposal.title}
                   </h3>
                   <p className="text-zinc-500 line-clamp-2 leading-relaxed font-medium text-sm">{heroProposal.description}</p>
                </div>

                <div className="mt-auto p-5 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                   <div className="relative z-10 flex gap-3">
                      <button
                         onClick={() => onSelectProposal(heroProposal)}
                         className="flex-1 relative overflow-hidden bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-zinc-900/20 group/btn"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] w-full h-full transform"></div>
                         <span className="flex items-center justify-center gap-2">
                            Review & Sign <Sparkles size={14} />
                         </span>
                      </button>
                      <button
                         onClick={handleDismiss}
                         className="px-5 py-3.5 bg-white text-zinc-600 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                         Dismiss
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Inbox size={28} className="text-zinc-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-zinc-500 mb-1">No Active Proposals</p>
                  <p className="text-sm text-zinc-400">Proposals from tracked DAOs will appear here.</p>
                </div>
              </div>
            )}
         </div>

         {/* 4. Mini Stat: DAOs */}
         <div className="col-span-1 bg-orange-50/50 border border-orange-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:rotate-1 hover:bg-orange-50 transition-all cursor-default group">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
               <Box size={20} />
            </div>
            <div>
               <div className="text-4xl font-extrabold text-zinc-900 mb-1"><AnimatedCounter end={uniqueDAOs} /></div>
               <div className="text-xs font-bold text-orange-700/60 uppercase tracking-wider">Active DAOs</div>
            </div>
         </div>

         {/* 5. Mini Stat: Proposals */}
         <div className="col-span-1 bg-blue-50/50 border border-blue-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:-rotate-1 hover:bg-blue-50 transition-all cursor-default group">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Check size={20} />
            </div>
            <div>
               <div className="text-4xl font-extrabold text-zinc-900 mb-1"><AnimatedCounter end={activeProposals} /></div>
               <div className="text-xs font-bold text-blue-700/60 uppercase tracking-wider">Active Proposals</div>
            </div>
         </div>

      </div>

      {/* --- Horizontal Scroll Feed for other proposals --- */}
      <div className="pt-8">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
               Upcoming Queue
               <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs">{queueCount}</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {CHAIN_FILTERS.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setChainFilter(cf.id)}
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
                 onClick={() => onChangeView?.('proposals')}
                 className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full"
              >
                 View All
              </button>
            </div>
         </div>

         {(() => {
           const queueProposals = proposals.slice(1);
           const filteredQueue = chainFilter === 'all'
             ? queueProposals
             : queueProposals.filter(p => p.snapshotNetwork === chainFilter);

           return filteredQueue.length === 0 ? (
           <div className="flex items-center justify-center py-12">
             <div className="text-center text-zinc-400">
               <Inbox size={32} className="mx-auto mb-3 text-zinc-300" />
               <p className="text-sm font-medium">No additional proposals in queue.</p>
             </div>
           </div>
         ) : (
           <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar snap-x px-1">
              {filteredQueue.map((p) => (
                 <div
                    key={p.id}
                    onClick={() => onSelectProposal(p)}
                    className="min-w-[320px] bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-center group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          p.source === 'Snapshot'
                          ? 'bg-yellow-100/80 text-yellow-700 border-yellow-200'
                          : 'bg-purple-100/80 text-purple-700 border-purple-200'
                       }`}>
                          {p.source}
                       </span>
                       <span className="text-xs font-mono text-zinc-400 bg-white/50 px-2 py-1 rounded-md border border-zinc-100">#{p.displayId || p.id.slice(0, 8)}</span>
                    </div>

                    <h4 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                       {p.title}
                    </h4>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-5 font-medium">
                       {p.description}
                    </p>

                    <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
                       <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 border border-zinc-200 shadow-inner">
                          {p.daoName[0]}
                       </div>
                       <span className="text-sm font-bold text-zinc-700">{p.daoName}</span>
                    </div>
                 </div>
              ))}

              {/* View More Card */}
              <div className="min-w-[120px] flex items-center justify-center">
                 <div
                    onClick={() => onChangeView?.('proposals')}
                    className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-50 hover:scale-110 hover:text-indigo-500 hover:border-indigo-200 transition-all duration-300 group"
                 >
                    <ArrowUpRight size={24} className="group-hover:rotate-45 transition-transform duration-300" />
                 </div>
              </div>
           </div>
         );
         })()}
      </div>

      {/* Points & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        <PointsPanel />
        <Leaderboard />
      </div>
    </div>
  );
};

export default Dashboard;
