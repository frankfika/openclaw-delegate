import React, { useState, useEffect } from 'react';
import { Search, CircleDot, CheckCircle2 } from 'lucide-react';
import { fetchActivityLog } from '../services/api';

const FALLBACK_LOG = [
  { id: 'evt-1092', time: '10:42 AM', action: 'Auto-Vote', target: 'Aave: Risk Parameter Update', status: 'success', hash: '0x3a...21f9' },
  { id: 'evt-1091', time: '09:15 AM', action: 'Scan', target: 'Uniswap: Fee Switch', status: 'warning', hash: '' },
  { id: 'evt-1090', time: 'Yesterday', action: 'Monitor', target: 'Compound: Market Add', status: 'neutral', hash: '' },
  { id: 'evt-1089', time: 'Yesterday', action: 'Vote', target: 'Lido: Node Operator Set', status: 'success', hash: '0x8b...99a1' },
];

const ActionLog: React.FC = () => {
  const [logs, setLogs] = useState(FALLBACK_LOG);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivityLog().then(data => {
      if (data.length > 0) {
        setLogs(data.map((d: any) => ({
          id: d.id,
          time: d.timestamp || d.time,
          action: d.action,
          target: d.target,
          status: d.status || 'neutral',
          hash: d.hash || d.txHash || '',
        })));
      }
    });
  }, []);

  const filtered = search
    ? logs.filter(l =>
        l.target.toLowerCase().includes(search.toLowerCase()) ||
        l.hash.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase())
      )
    : logs;
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="relative mb-8">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
         <input
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="Search transaction hash or event..."
           className="w-full bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
         />
      </div>

      <div className="relative border-l-2 border-zinc-200 ml-4 space-y-10">
         {filtered.map((log) => (
            <div key={log.id} className="relative pl-8 group">
               {/* Timeline Dot */}
               <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125 ${
                  log.status === 'success' ? 'bg-emerald-500' :
                  log.status === 'warning' ? 'bg-amber-500' : 'bg-zinc-400'
               }`}></div>

               <div className="bg-white/80 backdrop-blur-sm border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-float transition-all">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        log.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
                     }`}>
                        {log.action}
                     </span>
                     <span className="text-xs text-zinc-400 font-mono">{log.time}</span>
                  </div>
                  <h3 className="font-bold text-zinc-900">{log.target}</h3>
                  {log.hash && (
                     <div className="mt-2 text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Confirmed: {log.hash}
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ActionLog;
