import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  switch (level) {
    case RiskLevel.LOW:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Low Risk
        </span>
      );
    case RiskLevel.MEDIUM:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          Medium Risk
        </span>
      );
    case RiskLevel.HIGH:
    case RiskLevel.CRITICAL:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          {level} Risk
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
          <HelpCircle className="w-3.5 h-3.5" />
          Unknown
        </span>
      );
  }
};

export default RiskBadge;
