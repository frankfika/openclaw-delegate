import { Filter } from 'lucide-react';

export interface ChainFilter {
  id: string;
  label: string;
}

export const CHAIN_FILTERS: ChainFilter[] = [
  { id: 'all', label: 'All' },
  { id: '1', label: 'Ethereum' },
  { id: '42161', label: 'Arbitrum' },
  { id: '10', label: 'Optimism' },
  { id: '137', label: 'Polygon' },
];

interface ChainFiltersProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function ChainFilters({
  value,
  onChange,
  label = 'Filter by Network',
  size = 'md',
}: ChainFiltersProps) {
  const isSmall = size === 'sm';

  return (
    <div className={isSmall ? '' : 'flex-1'}>
      {!isSmall && (
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-zinc-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      <div className={`flex ${isSmall ? 'flex-wrap gap-1' : 'flex-wrap gap-2'}`}>
        {CHAIN_FILTERS.map((chain) => (
          <button
            key={chain.id}
            onClick={() => onChange(chain.id)}
            className={`
              rounded-xl font-semibold transition-all
              ${
                value === chain.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/70 text-zinc-600 hover:bg-white border border-zinc-200'
              }
              ${isSmall ? 'px-2.5 py-1 text-[10px]' : 'px-4 py-2 text-sm'}
            `}
          >
            {chain.label}
          </button>
        ))}
      </div>
    </div>
  );
}
