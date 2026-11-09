import React from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { LiveQuote } from '../types/trading';

interface Props {
  watchlist: LiveQuote[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  isUpdating: boolean;
}

export const TickerTape: React.FC<Props> = ({
  watchlist,
  selectedTicker,
  onSelectTicker,
  isUpdating
}) => {
  if (!watchlist || watchlist.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-[#1b2438] bg-[#0a0e17] overflow-x-auto no-scrollbar py-2 px-4 select-none">
      <div className="flex items-center space-x-3 min-w-max">
        <div className="flex items-center space-x-1.5 pr-2 border-r border-gray-800 text-[11px] font-mono text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isUpdating ? 'bg-amber-400 opacity-75' : 'bg-emerald-400 opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isUpdating ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="font-semibold text-gray-300">LIVE FEED</span>
        </div>

        {watchlist.map((quote) => {
          const isSelected = selectedTicker === quote.ticker;
          const isPositive = quote.change >= 0;

          return (
            <button
              key={quote.ticker}
              onClick={() => onSelectTicker(quote.ticker)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-sm shadow-blue-500/10'
                  : 'bg-[#0f1523]/80 hover:bg-[#151d30] border-[#1b2438] text-gray-300 hover:border-gray-700'
              }`}
            >
              <span className="font-bold tracking-tight text-white">{quote.ticker}</span>
              <span className="text-gray-200 font-semibold">${quote.current_price.toFixed(2)}</span>
              <span
                className={`flex items-center space-x-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}
                  {quote.change_percent.toFixed(2)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
