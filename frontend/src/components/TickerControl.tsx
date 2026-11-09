import React, { useState } from 'react';
import { Search, Zap, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { LiveQuote } from '../types/trading';

interface Props {
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  onRunCycle: (ticker: string, forceAction?: string) => void;
  isLoading: boolean;
  currentQuote?: LiveQuote | null;
}

const PRESET_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'BTC-USD', 'TSLA', 'SPY', 'QQQ'];

export const TickerControl: React.FC<Props> = ({
  selectedTicker,
  onSelectTicker,
  onRunCycle,
  isLoading,
  currentQuote
}) => {
  const [customTicker, setCustomTicker] = useState('');
  const [forceAction, setForceAction] = useState<string>('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker.trim()) {
      onSelectTicker(customTicker.trim().toUpperCase());
      setCustomTicker('');
    }
  };

  const isPositive = currentQuote ? currentQuote.change >= 0 : true;

  return (
    <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm space-y-3.5">
      {/* Top Row: Presets, Custom Input, & Execution Trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Preset Tickers & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider mr-1">
            Watchlist:
          </span>
          {PRESET_TICKERS.map((t) => {
            const isSelected = selectedTicker === t;
            return (
              <button
                key={t}
                onClick={() => onSelectTicker(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 scale-105'
                    : 'bg-[#090d16] text-gray-300 hover:bg-[#151e30] border-[#1b2438] hover:text-white'
                }`}
              >
                {t}
              </button>
            );
          })}

          <form onSubmit={handleCustomSubmit} className="flex items-center ml-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Lookup (e.g. AMZN)..."
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value)}
                className="bg-[#090d16] border border-[#1b2438] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono w-40 uppercase placeholder-gray-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </form>
        </div>

        {/* Execution Mode & Trigger Button */}
        <div className="flex items-center space-x-3 self-end lg:self-auto">
          <select
            value={forceAction}
            onChange={(e) => setForceAction(e.target.value)}
            className="bg-[#090d16] border border-[#1b2438] text-gray-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-mono"
            title="Algorithm Mode Override"
          >
            <option value="">Mode: Autonomous AI Synthesis</option>
            <option value="BUY">Test Guardrail: Force BUY</option>
            <option value="SELL">Test Guardrail: Force SELL</option>
            <option value="HOLD">Test Guardrail: Force HOLD</option>
          </select>

          <button
            onClick={() => onRunCycle(selectedTicker, forceAction || undefined)}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center space-x-2 shadow-xl ${
              isLoading
                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white shadow-blue-500/25 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>Run Agent Cycle ({selectedTicker})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Real-time Live Market Data Header */}
      {currentQuote && (
        <div className="pt-3 border-t border-[#1b2438] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[11px] font-sans">LIVE PRICE:</span>
              <span className="text-xl font-black text-white">
                ${currentQuote.current_price.toFixed(2)}
              </span>
            </div>

            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
              isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? '+' : ''}${currentQuote.change.toFixed(2)} ({isPositive ? '+' : ''}{currentQuote.change_percent.toFixed(2)}%)
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-3 text-gray-400 text-[11px]">
              <span>Day H: <strong className="text-gray-200">${currentQuote.day_high.toFixed(2)}</strong></span>
              <span>Day L: <strong className="text-gray-200">${currentQuote.day_low.toFixed(2)}</strong></span>
              <span>Vol: <strong className="text-gray-200">{(currentQuote.volume / 1000000).toFixed(1)}M</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-gray-400">
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-900 border border-gray-800">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{currentQuote.market_status}</span>
            </span>
            <span className="text-gray-500 hidden md:inline">
              Sync: {new Date(currentQuote.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
