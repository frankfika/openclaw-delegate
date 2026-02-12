import { Filter } from 'lucide-react';

interface DaoFilterProps {
  value: string;
  onChange: (value: string) => void;
  daos: string[];
}

export function DaoFilter({ value, onChange, daos }: DaoFilterProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={14} className="text-zinc-500" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Filter by DAO
        </span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 rounded-xl text-sm font-semibold bg-white/70 border border-zinc-200 hover:bg-white transition-all appearance-none pr-10"
        >
          <option value="all">All DAOs ({daos.length})</option>
          {daos.map((dao) => (
            <option key={dao} value={dao}>{dao}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
