import React from 'react';
import { Layers, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign } from 'lucide-react';
import { Position } from '../types/trading';

interface Props {
  positions: Position[];
  onLiquidate?: (ticker: string) => void;
  isPrivacyMode: boolean;
}

export const PositionsTable: React.FC<Props> = ({ positions, onLiquidate, isPrivacyMode }) => {
  const mask = (val: string) => (isPrivacyMode ? '$••••••••' : val);

  return (
    <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[#1b2438] flex items-center justify-between bg-[#0a0e17]">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Active Portfolio Holdings
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400">
          {positions.length} Open Position{positions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090d16] text-gray-400 border-b border-[#1b2438] text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Asset</th>
              <th className="px-5 py-3 font-semibold">Shares</th>
              <th className="px-5 py-3 font-semibold">Avg Entry</th>
              <th className="px-5 py-3 font-semibold">Current Price</th>
              <th className="px-5 py-3 font-semibold">Market Value</th>
              <th className="px-5 py-3 font-semibold">Unrealized P&L</th>
              <th className="px-5 py-3 font-semibold">Stop Loss</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2438] text-gray-200">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-500 font-sans text-xs">
                  No active holdings. Run an agent cycle to simulate trades.
                </td>
              </tr>
            ) : (
              positions.map((pos) => {
                const isProfitable = pos.unrealized_pnl >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-[#131c2e]/60 transition">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>{pos.ticker}</span>
                    </td>
                    <td className="px-5 py-3.5">{pos.shares}</td>
                    <td className="px-5 py-3.5">${pos.avg_entry_price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-semibold text-white">${pos.current_price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-bold">{mask(`$${pos.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}</td>
                    <td className="px-5 py-3.5">
                      <div className={`flex items-center space-x-1 font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{mask(`${isProfitable ? '+' : ''}$${pos.unrealized_pnl.toFixed(2)}`)}</span>
                        <span className="text-[10px] opacity-80">({pos.unrealized_pnl_pct.toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-rose-400 font-medium">
                      {pos.stop_loss ? `$${pos.stop_loss.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {onLiquidate && (
                        <button
                          onClick={() => onLiquidate(pos.ticker)}
                          title={`Sell ${pos.shares} shares of ${pos.ticker}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition"
                        >
                          Liquidate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
