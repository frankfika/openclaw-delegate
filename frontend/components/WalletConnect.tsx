import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, X } from 'lucide-react';

const CHAIN_LABELS: Record<number, string> = {
  1: 'ETH',
  11155111: 'SEP',
  42161: 'ARB',
  10: 'OP',
  137: 'POLY',
};

const CONNECTOR_LABELS: Record<string, string> = {
  'injected': 'Browser Wallet',
  'metaMask': 'MetaMask',
  'walletConnect': 'WalletConnect',
  'coinbaseWallet': 'Coinbase Wallet',
};

const WalletConnect: React.FC = () => {
  const { address, isConnected, chain, connectors, connect, disconnect, error } = useWallet();
  const [showModal, setShowModal] = useState(false);

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
    <>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => setShowModal(true)}
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

      {/* Wallet Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-zinc-900">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowModal(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                    <Wallet size={20} className="text-zinc-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">
                      {CONNECTOR_LABELS[connector.id] || connector.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {connector.id === 'injected' && 'MetaMask, Trust, Coinbase, etc.'}
                      {connector.id === 'walletConnect' && 'Scan with mobile wallet'}
                      {connector.id === 'coinbaseWallet' && 'Connect with Coinbase'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;
