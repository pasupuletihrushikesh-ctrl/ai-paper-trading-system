import React from 'react';
import { DollarSign, Wallet, TrendingUp, TrendingDown, Target, Layers } from 'lucide-react';
import { PortfolioStatus } from '../types/trading';

interface Props {
  portfolio: PortfolioStatus | null;
}

export const PortfolioOverview: React.FC<Props> = ({ portfolio }) => {
  const equity = portfolio?.total_equity ?? 100000.0;
  const cash = portfolio?.cash_balance ?? 100000.0;
  const dailyPnl = portfolio?.daily_pnl ?? 0.0;
  const dailyPnlPct = portfolio?.daily_pnl_pct ?? 0.0;
  const winRate = portfolio?.win_rate ?? 0.0;
  const positionsCount = portfolio?.positions_count ?? 0;
  const closedCount = portfolio?.closed_trades_count ?? 0;

  const isPositive = dailyPnl >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Equity */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
          <span>Total Equity</span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-white">
          ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-gray-400 mt-1 flex items-center">
          <span className="text-gray-500 mr-1">Base:</span> $100,000.00
        </div>
      </div>

      {/* Cash Balance */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
          <span>Cash Balance</span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-white">
          ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          {((cash / equity) * 100).toFixed(1)}% liquid
        </div>
      </div>

      {/* Daily P&L */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
          <span>Daily P&L</span>
          <div className={`p-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}${dailyPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-[11px] font-semibold mt-1 ${isPositive ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
          {isPositive ? '+' : ''}{dailyPnlPct.toFixed(2)}% today
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
          <span>Win Rate</span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-400">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
          {winRate.toFixed(1)}%
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          {portfolio?.winning_trades_count ?? 0}W / {closedCount} closed trades
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
          <span>Active Holdings</span>
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-white">
          {positionsCount}
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          Max allocation cap: 5.0%
        </div>
      </div>
    </div>
  );
};
