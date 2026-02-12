import { HelpCircle } from 'lucide-react';

export function QuickStartGuide() {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm animate-in fade-in duration-700 delay-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-500 rounded-2xl">
          <HelpCircle size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">How VoteNow Works</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Browse Proposals</p>
                <p className="text-xs text-zinc-500">View real governance proposals from 50+ DAOs, aggregated from Snapshot</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-violet-600">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Get AI Analysis</p>
                <p className="text-xs text-zinc-500">Click any proposal to see AI-powered risk analysis and voting recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Vote & Earn Points</p>
                <p className="text-xs text-zinc-500">If you hold the DAO's tokens, vote directly and earn rewards</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 bg-white/60 rounded-lg px-3 py-2 border border-indigo-100">
            <strong>Note:</strong> To vote, you need governance tokens from the specific DAO.
            Don't have tokens?{' '}
            <a href="https://app.uniswap.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline font-semibold">
              Buy on Uniswap →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
