import React from 'react';
import { History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TradeLog } from '../types/trading';

interface Props {
  trades: TradeLog[];
}

export const TradeLogTable: React.FC<Props> = ({ trades }) => {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Historical Audit Trade Log</h3>
        </div>
        <span className="text-xs font-mono text-gray-400">
          {trades.length} Execution Log{trades.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800 text-[11px] uppercase">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Time</th>
              <th className="px-4 py-2.5 font-semibold">Run ID</th>
              <th className="px-4 py-2.5 font-semibold">Ticker</th>
              <th className="px-4 py-2.5 font-semibold">Action</th>
              <th className="px-4 py-2.5 font-semibold">Shares</th>
              <th className="px-4 py-2.5 font-semibold">Fill Price</th>
              <th className="px-4 py-2.5 font-semibold">Notional</th>
              <th className="px-4 py-2.5 font-semibold">Risk Engine</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Audit Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-200">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500 font-sans text-xs">
                  No trades recorded yet. Run an agent cycle to simulate trades.
                </td>
              </tr>
            ) : (
              trades.map((t) => {
                const isBuy = t.action === 'BUY';
                const isSell = t.action === 'SELL';
                const timeStr = typeof t.created_at === 'string' ? t.created_at.slice(11, 19) : '';

                return (
                  <tr key={t.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3 text-gray-400 text-[11px]">{timeStr || 'Now'}</td>
                    <td className="px-4 py-3 text-gray-500 text-[10px]">{t.run_id.slice(0, 10)}...</td>
                    <td className="px-4 py-3 font-bold text-white">{t.ticker}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isBuy ? 'bg-emerald-500/20 text-emerald-400' : isSell ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.shares}</td>
                    <td className="px-4 py-3">${t.fill_price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">${t.notional_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.risk_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.risk_status === 'SCALED_DOWN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {t.risk_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold text-[11px] ${
                        t.execution_status === 'FILLED' ? 'text-emerald-400' :
                        t.execution_status === 'REJECTED' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {t.execution_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[11px] max-w-xs truncate" title={t.risk_reason || ''}>
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
