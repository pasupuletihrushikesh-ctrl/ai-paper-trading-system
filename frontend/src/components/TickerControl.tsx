import React, { useState } from 'react';
import { Play, Search, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  onRunCycle: (ticker: string, forceAction?: string) => void;
  isLoading: boolean;
}

const PRESET_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'BTC-USD', 'TSLA'];

export const TickerControl: React.FC<Props> = ({
  selectedTicker,
  onSelectTicker,
  onRunCycle,
  isLoading
}) => {
  const [customTicker, setCustomTicker] = useState('');
  const [forceAction, setForceAction] = useState<string>('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker.trim()) {
      const clean = customTicker.trim().toUpperCase();
      onSelectTicker(clean);
      setCustomTicker('');
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Preset Tickers & Custom Input */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESET_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                selectedTicker === t
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/60'
              }`}
            >
              {t}
            </button>
          ))}

          <form onSubmit={handleCustomSubmit} className="flex items-center ml-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Custom ticker..."
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono w-32 uppercase"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-2" />
            </div>
          </form>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Optional Test Override selector */}
          <select
            value={forceAction}
            onChange={(e) => setForceAction(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 font-mono"
            title="Optional manual override (Auto uses Multi-Agent LangGraph synthesis)"
          >
            <option value="">Mode: Full Agentic Synthesis</option>
            <option value="BUY">Force BUY Signal (Test Guardrail)</option>
            <option value="SELL">Force SELL Signal</option>
            <option value="HOLD">Force HOLD Signal</option>
          </select>

          <button
            onClick={() => onRunCycle(selectedTicker, forceAction || undefined)}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition flex items-center space-x-2 shadow-lg ${
              isLoading
                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Executing Graph...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Run Agent Cycle ({selectedTicker})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
