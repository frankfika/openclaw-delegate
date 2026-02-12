import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut } from 'lucide-react';

const CHAIN_LABELS: Record<number, string> = {
  1: 'ETH',
  11155111: 'SEP',
  42161: 'ARB',
  10: 'OP',
  137: 'POLY',
};

const WalletConnect: React.FC = () => {
  const { address, isConnected, chain, connectWallet, disconnect, error } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/60 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-mono font-medium text-zinc-600">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {chain && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase">
              {CHAIN_LABELS[chain.id] || chain.name?.slice(0, 4)?.toUpperCase() || 'ETH'}
            </span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="w-8 h-8 rounded-full bg-white/60 border border-zinc-200/60 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          title="Disconnect wallet"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg"
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">Connect</span>
      </button>
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          {error.message || 'Connection failed'}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
