import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
          <h3 className="text-2xl font-mono mt-1 text-white">{value}</h3>
        </div>
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
          {icon}
        </div>
      </div>
      {change && (
        <div className={`text-xs font-medium ${
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {change}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
