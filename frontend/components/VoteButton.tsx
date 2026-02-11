import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';

interface VoteButtonProps {
  proposalId: string;
  recommendation: string;
  spaceId?: string;
  snapshotId?: string;
  choices?: string[];
}

const VoteButton: React.FC<VoteButtonProps> = ({
  proposalId,
  recommendation,
  spaceId,
  snapshotId,
  choices,
}) => {
  const { address, isConnected, connectWallet } = useWallet();
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (direction: 'For' | 'Against' | 'Abstain') => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setVoting(true);
    setError(null);

    try {
      // Record vote intent on backend
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: snapshotId || proposalId,
          direction,
          walletAddress: address,
          type: 'snapshot',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Vote failed' }));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      // For demo: simulate Snapshot vote signature
      // In production, this would use snapshot.js SDK with EIP-712 signing
      await new Promise(r => setTimeout(r, 1500));

      setVoted(direction);
    } catch (err: any) {
      setError(err.message || 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  if (voted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Vote Recorded: {voted}</p>
            <p className="text-xs text-emerald-600">Signed by {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>
        {snapshotId && (
          <a
            href={`https://snapshot.org/#/${spaceId}/proposal/${snapshotId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View on Snapshot <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <X size={16} className="text-rose-500" />
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="w-full py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!isConnected && (
        <p className="text-xs text-zinc-400 text-center mb-2">Connect wallet to vote</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => handleVote('For')}
          disabled={voting}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {voting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Vote For
        </button>
        <button
          onClick={() => handleVote('Against')}
          disabled={voting}
          className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {voting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          Against
        </button>
      </div>
      {recommendation && (
        <p className="text-xs text-center text-zinc-400">
          AI recommends: <span className="font-bold text-zinc-600">{recommendation}</span>
        </p>
      )}
    </div>
  );
};

export default VoteButton;
