import React, { useState } from 'react';
import { History, ShieldCheck, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { TradeLog } from '../types/trading';

interface Props {
  trades: TradeLog[];
  isPrivacyMode: boolean;
}

export const TradeLogTable: React.FC<Props> = ({ trades, isPrivacyMode }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredTrades = trades.filter((t) => {
    if (filterAction === 'ALL') return true;
    if (filterAction === 'BUY') return t.action === 'BUY';
    if (filterAction === 'SELL') return t.action === 'SELL';
    if (filterAction === 'REJECTED') return t.execution_status === 'REJECTED';
    return true;
  });

  const mask = (val: string) => (isPrivacyMode ? '$••••••••' : val);

  return (
    <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl overflow-hidden shadow-sm">
      {/* Header and Filter */}
      <div className="px-5 py-3.5 border-b border-[#1b2438] flex flex-wrap items-center justify-between gap-3 bg-[#0a0e17]">
        <div className="flex items-center space-x-2.5">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Historical Audit Trade Log
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex items-center bg-[#090d16] p-0.5 rounded-lg border border-[#1b2438] text-[11px] font-mono">
            {['ALL', 'BUY', 'SELL', 'REJECTED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterAction(f)}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterAction === f
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090d16] text-gray-400 border-b border-[#1b2438] text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Timestamp</th>
              <th className="px-5 py-3 font-semibold">Order / Run ID</th>
              <th className="px-5 py-3 font-semibold">Asset</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Shares</th>
              <th className="px-5 py-3 font-semibold">Fill Price</th>
              <th className="px-5 py-3 font-semibold">Notional</th>
              <th className="px-5 py-3 font-semibold">Route</th>
              <th className="px-5 py-3 font-semibold">Risk Status</th>
              <th className="px-5 py-3 font-semibold">Audit Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2438] text-gray-200">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-8 text-center text-gray-500 font-sans text-xs">
                  No trade executions match the active filter.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => {
                const isBuy = t.action === 'BUY';
                const isSell = t.action === 'SELL';
                const isAlpaca = t.execution_type === 'ALPACA_PAPER';
                const timeStr = typeof t.created_at === 'string' ? t.created_at.slice(11, 19) : '';

                return (
                  <tr key={t.id} className="hover:bg-[#131c2e]/60 transition">
                    <td className="px-5 py-3.5 text-gray-400 text-[11px]">{timeStr || 'Recent'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-[11px] font-mono">
                      {t.run_id.slice(0, 10)}...
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">{t.ticker}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isBuy ? 'bg-emerald-500/20 text-emerald-400' : isSell ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold">{t.shares}</td>
                    <td className="px-5 py-3.5">${t.fill_price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-bold">{mask(`$${t.notional_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        isAlpaca
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {isAlpaca ? 'ALPACA LIVE' : 'LOCAL MOCK'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.risk_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.risk_status === 'SCALED_DOWN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {t.risk_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-[11px] max-w-xs truncate" title={t.risk_reason || ''}>
                      {t.risk_reason || '—'}
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
