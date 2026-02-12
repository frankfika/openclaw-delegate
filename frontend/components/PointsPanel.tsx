import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { fetchUserDashboard } from '../services/api';
import { Award, Flame, TrendingUp, Star } from 'lucide-react';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Newcomer',
  2: 'Voter',
  3: 'Delegate',
  4: 'Governor',
  5: 'Council',
  6: 'DAO Legend',
};

const PointsPanel: React.FC = () => {
  const { address, isConnected } = useWallet();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setDashboard(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchUserDashboard(address)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch(() => {
        if (!cancelled) setDashboard(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isConnected, address]);

  if (!isConnected || loading || !dashboard) return null;

  const { points, level, levelProgress, streak } = dashboard;
  const totalPoints = points?.balance ?? 0;
  const currentLevel = level ?? 1;
  const progress = levelProgress ?? 0;
  const currentStreak = streak?.current ?? 0;

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-xl border border-amber-100/60 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Award size={16} className="text-amber-600" />
        </div>
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Your Points</span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-extrabold text-zinc-900 tracking-tighter">
          {totalPoints.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-amber-600">pts</span>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-zinc-700">
              Lv.{currentLevel} {LEVEL_NAMES[currentLevel] || ''}
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-amber-100">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-zinc-700">{currentStreak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-amber-100">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-xs font-bold text-zinc-700">{dashboard.totalVotes ?? 0} votes</span>
        </div>
      </div>
    </div>
  );
};

export default PointsPanel;
