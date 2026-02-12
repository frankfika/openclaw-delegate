import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { fetchLeaderboard } from '../services/api';
import { Trophy, Medal } from 'lucide-react';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Newcomer',
  2: 'Voter',
  3: 'Delegate',
  4: 'Governor',
  5: 'Council',
  6: 'Legend',
};

const Leaderboard: React.FC = () => {
  const { address } = useWallet();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchLeaderboard(20)
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={16} className="text-amber-500 fill-amber-500" />;
    if (rank === 2) return <Medal size={16} className="text-zinc-400" />;
    if (rank === 3) return <Medal size={16} className="text-amber-700" />;
    return <span className="text-xs font-bold text-zinc-400 w-4 text-center">{rank}</span>;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <Trophy size={16} className="text-amber-500" />
        </div>
        <h3 className="font-bold text-zinc-800 text-sm">Leaderboard</h3>
        <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
          Top {entries.length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
          <span className="text-xs font-medium">Loading rankings...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <p className="text-sm font-medium">No rankings yet</p>
          <p className="text-xs mt-1">Vote on proposals to earn points!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = address?.toLowerCase() === entry.walletAddress?.toLowerCase();

            return (
              <div
                key={entry.walletAddress || index}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isCurrentUser
                    ? 'bg-indigo-50 border border-indigo-100'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <div className="w-6 flex justify-center">{getRankIcon(rank)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-medium truncate ${isCurrentUser ? 'text-indigo-700' : 'text-zinc-700'}`}>
                      {entry.walletAddress
                        ? `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`
                        : 'Unknown'}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-900">
                    {(entry.totalPoints ?? entry.balance ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400">
                    Lv.{entry.level ?? 1} {LEVEL_NAMES[entry.level ?? 1] || ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
