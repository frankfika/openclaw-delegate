import { ArrowUpRight, ShieldCheck, Box, Check, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';

interface StatsCardsProps {
  totalVotes: number;
  activeProposals: number;
  uniqueDAOs: number;
  activityData: { name: string; value: number }[];
}

export function StatsCards({
  totalVotes,
  activeProposals,
  uniqueDAOs,
  activityData,
}: StatsCardsProps) {
  return (
    <>
      {/* Main Stats Card */}
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

      {/* Activity Chart */}
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

      {/* Mini Stat: DAOs */}
      <div className="col-span-1 bg-orange-50/50 border border-orange-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:rotate-1 hover:bg-orange-50 transition-all cursor-default group">
        <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
          <Box size={20} />
        </div>
        <div>
          <div className="text-4xl font-extrabold text-zinc-900 mb-1">
            <AnimatedCounter end={uniqueDAOs} />
          </div>
          <div className="text-xs font-bold text-orange-700/60 uppercase tracking-wider">Active DAOs</div>
        </div>
      </div>

      {/* Mini Stat: Proposals */}
      <div className="col-span-1 bg-blue-50/50 border border-blue-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:-rotate-1 hover:bg-blue-50 transition-all cursor-default group">
        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <Check size={20} />
        </div>
        <div>
          <div className="text-4xl font-extrabold text-zinc-900 mb-1">
            <AnimatedCounter end={activeProposals} />
          </div>
          <div className="text-xs font-bold text-blue-700/60 uppercase tracking-wider">Active Proposals</div>
        </div>
      </div>
    </>
  );
}
