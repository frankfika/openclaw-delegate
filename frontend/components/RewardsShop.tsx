import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { fetchRewards, fetchUserPoints, redeemReward, fetchRedemptions } from '../services/api';
import { Gift, ShoppingBag, Loader2, Check, Package, Clock, Wallet } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  token: <Package size={20} className="text-blue-500" />,
  nft: <Gift size={20} className="text-violet-500" />,
  voucher: <ShoppingBag size={20} className="text-emerald-500" />,
};

const RewardsShop: React.FC = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const [rewards, setRewards] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [tab, setTab] = useState<'shop' | 'history'>('shop');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const promises: Promise<any>[] = [
      fetchRewards().catch(() => []),
    ];

    if (isConnected && address) {
      promises.push(
        fetchUserPoints(address).then(d => d.balance ?? d.totalPoints ?? 0).catch(() => 0),
        fetchRedemptions(address).catch(() => []),
      );
    }

    Promise.all(promises).then(([rw, balance, reds]) => {
      if (cancelled) return;
      setRewards(Array.isArray(rw) ? rw : []);
      if (balance !== undefined) setUserBalance(balance);
      if (reds !== undefined) setRedemptions(Array.isArray(reds) ? reds : []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [isConnected, address]);

  const handleRedeem = async (rewardId: string) => {
    if (!isConnected || !address) {
      connectWallet();
      return;
    }

    setRedeemingId(rewardId);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      await redeemReward(address, rewardId);
      setRedeemSuccess(rewardId);

      // Refresh data
      const [pts, reds] = await Promise.all([
        fetchUserPoints(address).then(d => d.balance ?? d.totalPoints ?? 0).catch(() => userBalance),
        fetchRedemptions(address).catch(() => redemptions),
      ]);
      setUserBalance(pts);
      setRedemptions(Array.isArray(reds) ? reds : []);

      setTimeout(() => setRedeemSuccess(null), 3000);
    } catch (err: any) {
      setRedeemError(err.message);
      setTimeout(() => setRedeemError(null), 5000);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/50">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Gift size={22} className="text-indigo-500" />
            Rewards Shop
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">Redeem your governance points for rewards</p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-amber-100 shadow-sm">
            <Wallet size={14} className="text-amber-600" />
            <span className="text-sm font-bold text-zinc-800">{userBalance.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-600">pts available</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {redeemError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm font-medium text-rose-700">
          {redeemError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('shop')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            tab === 'shop'
              ? 'bg-zinc-900 text-white shadow-lg'
              : 'bg-white/60 text-zinc-600 hover:bg-zinc-50 border border-zinc-100'
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            tab === 'history'
              ? 'bg-zinc-900 text-white shadow-lg'
              : 'bg-white/60 text-zinc-600 hover:bg-zinc-50 border border-zinc-100'
          }`}
        >
          My Redemptions
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-zinc-400 mr-2" />
          <span className="text-sm text-zinc-500 font-medium">Loading rewards...</span>
        </div>
      ) : tab === 'shop' ? (
        /* Rewards Grid */
        rewards.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Gift size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-bold text-zinc-500">No rewards available yet</p>
            <p className="text-sm mt-1">Check back soon for new rewards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canAfford = userBalance >= (reward.pointsCost ?? reward.cost ?? Infinity);
              const isRedeeming = redeemingId === reward.id;
              const justRedeemed = redeemSuccess === reward.id;
              const outOfStock = (reward.stock ?? reward.remaining ?? 1) <= 0;

              return (
                <div
                  key={reward.id}
                  className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                      {CATEGORY_ICONS[reward.category?.toLowerCase()] || <Gift size={20} className="text-zinc-400" />}
                    </div>
                    {reward.category && (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 px-2 py-1 rounded-full">
                        {reward.category}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-zinc-900 text-sm mb-1">{reward.name || reward.title}</h4>
                  <p className="text-xs text-zinc-500 mb-4 flex-1">{reward.description || ''}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-extrabold text-zinc-900">
                        {(reward.pointsCost ?? reward.cost ?? 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-amber-600">pts</span>
                    </div>

                    {reward.stock !== undefined && (
                      <span className="text-[10px] font-bold text-zinc-400">
                        {reward.stock ?? reward.remaining ?? 0} left
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!isConnected || !canAfford || isRedeeming || outOfStock || justRedeemed}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      justRedeemed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : !isConnected || !canAfford || outOfStock
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-900 text-white hover:bg-indigo-600 shadow-lg'
                    }`}
                  >
                    {isRedeeming ? (
                      <><Loader2 size={14} className="animate-spin" /> Redeeming...</>
                    ) : justRedeemed ? (
                      <><Check size={14} /> Redeemed!</>
                    ) : outOfStock ? (
                      'Out of Stock'
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : !canAfford ? (
                      'Not Enough Points'
                    ) : (
                      'Redeem'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Redemption History */
        redemptions.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Clock size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-bold text-zinc-500">No redemptions yet</p>
            <p className="text-sm mt-1">Redeem rewards to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {redemptions.map((r, i) => (
              <div key={r.id || i} className="bg-white/80 border border-white/60 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Check size={16} className="text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-800">{r.rewardName || r.name || 'Reward'}</p>
                  <p className="text-xs text-zinc-500">
                    {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString() : ''}
                    {r.pointsSpent ? ` · ${r.pointsSpent} pts` : ''}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  r.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  r.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  'bg-zinc-100 text-zinc-500'
                }`}>
                  {r.status || 'completed'}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default RewardsShop;
