import { Wallet, Check } from 'lucide-react';
import WalletConnect from '../WalletConnect';

export function WalletConnectBanner() {
  return (
    <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-2 border-indigo-200 rounded-3xl p-8 shadow-lg">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex p-4 bg-indigo-100 rounded-2xl">
          <Wallet size={32} className="text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900">Connect Your Wallet to Get Started</h3>
        <p className="text-zinc-600 leading-relaxed">
          Connect your wallet to view your voting power, earn points by participating in governance,
          and redeem rewards. You can browse all proposals without connecting, but you'll need a wallet to vote.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Check size={16} className="text-emerald-500" />
            <span>Browse proposals anytime</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Check size={16} className="text-emerald-500" />
            <span>Get AI analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Check size={16} className="text-emerald-500" />
            <span>Vote & earn rewards</span>
          </div>
        </div>
        <div className="pt-4">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
