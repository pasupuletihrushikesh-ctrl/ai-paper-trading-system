import React from 'react';
import { Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Position } from '../types/trading';

interface Props {
  positions: Position[];
}

export const PositionsTable: React.FC<Props> = ({ positions }) => {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Portfolio Positions</h3>
        </div>
        <span className="text-xs font-mono text-gray-400">
          {positions.length} Open Position{positions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800 text-[11px] uppercase">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Ticker</th>
              <th className="px-4 py-2.5 font-semibold">Shares</th>
              <th className="px-4 py-2.5 font-semibold">Avg Entry</th>
              <th className="px-4 py-2.5 font-semibold">Current Price</th>
              <th className="px-4 py-2.5 font-semibold">Market Value</th>
              <th className="px-4 py-2.5 font-semibold">Unrealized P&L</th>
              <th className="px-4 py-2.5 font-semibold">Stop Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-200">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500 font-sans text-xs">
                  No active holdings. Run an agent cycle to execute automated simulated trades.
                </td>
              </tr>
            ) : (
              positions.map((pos) => {
                const isProfitable = pos.unrealized_pnl >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3 font-bold text-white flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>{pos.ticker}</span>
                    </td>
                    <td className="px-4 py-3">{pos.shares}</td>
                    <td className="px-4 py-3">${pos.avg_entry_price.toFixed(2)}</td>
                    <td className="px-4 py-3">${pos.current_price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">${pos.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center space-x-1 font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfitable ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isProfitable ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}</span>
                        <span className="text-[10px] opacity-80">({pos.unrealized_pnl_pct.toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-red-400/90 font-medium">
                      {pos.stop_loss ? `$${pos.stop_loss.toFixed(2)}` : '—'}
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
