import React, { useState } from 'react';
import { Save, Shield, Zap, ToggleRight, ToggleLeft } from 'lucide-react';

const AgentConfig: React.FC = () => {
  const [autoVote, setAutoVote] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState('low');
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h2>
        <p className="text-zinc-500 mt-1">Configure your agent's autonomy and risk parameters.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-soft">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                 <Shield size={20} />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Governance Identity</h3>
           </div>
           
           <div className="space-y-6 max-w-lg">
              <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Risk Tolerance</label>
                 <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800/50">
                    {['Low', 'Medium', 'High'].map((level) => (
                       <button
                          key={level}
                          onClick={() => setRiskTolerance(level.toLowerCase())}
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                             riskTolerance === level.toLowerCase()
                             ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                             : 'text-zinc-500 hover:text-zinc-900'
                          }`}
                       >
                          {level}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-soft">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                    <Zap size={20} />
                 </div>
                 <div>
                     <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Autopilot Mode</h3>
                     <p className="text-sm text-zinc-500">Allow agent to execute votes without confirmation.</p>
                 </div>
              </div>
              <button onClick={() => setAutoVote(!autoVote)} className="text-zinc-400 hover:text-indigo-600 transition-colors">
                  {autoVote ? <ToggleRight size={40} className="text-indigo-600" /> : <ToggleLeft size={40} />}
              </button>
           </div>
           
           {autoVote && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4">
                 <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">Safety Limits Active</p>
                 <ul className="list-disc pl-4 space-y-1 text-sm text-amber-700 dark:text-amber-300/80">
                    <li>Max Gas: 50 gwei</li>
                    <li>Only "Low Risk" audited proposals</li>
                 </ul>
              </div>
           )}
        </div>

        <div className="flex justify-end">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/10">
              <Save size={18} /> Save Changes
           </button>
        </div>

      </div>
    </div>
  );
};

export default AgentConfig;
