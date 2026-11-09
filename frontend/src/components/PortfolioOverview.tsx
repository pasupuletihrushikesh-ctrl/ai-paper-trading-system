import React from 'react';
import { DollarSign, Wallet, TrendingUp, TrendingDown, Target, ShieldCheck } from 'lucide-react';
import { PortfolioStatus } from '../types/trading';

interface Props {
  portfolio: PortfolioStatus | null;
  isPrivacyMode: boolean;
}

export const PortfolioOverview: React.FC<Props> = ({ portfolio, isPrivacyMode }) => {
  const equity = portfolio?.total_equity ?? 100000.0;
  const cash = portfolio?.cash_balance ?? 100000.0;
  const dailyPnl = portfolio?.daily_pnl ?? 0.0;
  const dailyPnlPct = portfolio?.daily_pnl_pct ?? 0.0;
  const winRate = portfolio?.win_rate ?? 0.0;
  const positionsCount = portfolio?.positions_count ?? 0;
  const closedCount = portfolio?.closed_trades_count ?? 0;
  const isPositive = dailyPnl >= 0;

  const maskValue = (val: string) => isPrivacyMode ? '$••••••••' : val;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* 1. Total Equity */}
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">Total Portfolio</span>
          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
          {maskValue(`$${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
        </div>
        <div className="text-[11px] text-gray-400 mt-1 font-mono flex items-center justify-between">
          <span>Base: $100k</span>
          <span className="text-emerald-400 font-semibold">{isPositive ? '+' : ''}{dailyPnlPct.toFixed(2)}%</span>
        </div>
      </div>

      {/* 2. Liquid Cash */}
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">Liquid Cash</span>
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
          {maskValue(`$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
        </div>
        <div className="text-[11px] text-gray-400 mt-1 font-mono">
          {((cash / equity) * 100).toFixed(1)}% Available Buying Power
        </div>
      </div>

      {/* 3. Daily P&L */}
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-gray-700 transition">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">Daily P&L</span>
          <div className={`p-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {maskValue(`${isPositive ? '+' : ''}$${dailyPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
        </div>
        <div className={`text-[11px] font-mono font-semibold mt-1 ${isPositive ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
          {isPositive ? '+' : ''}{dailyPnlPct.toFixed(2)}% Session Return
        </div>
      </div>

      {/* 4. Strategy Win Rate */}
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">Algorithm Win Rate</span>
          <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-purple-300 tracking-tight">
          {winRate.toFixed(1)}%
        </div>
        <div className="text-[11px] text-gray-400 mt-1 font-mono">
          {portfolio?.winning_trades_count ?? 0} Won / {closedCount} Total Realized
        </div>
      </div>

      {/* 5. Risk Guardrail Engine */}
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm relative overflow-hidden col-span-2 md:col-span-1 group hover:border-blue-500/40 transition">
        <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1.5">
          <span className="uppercase tracking-wider text-[11px] font-semibold text-gray-400">Risk Guardrail</span>
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight flex items-center space-x-1.5">
          <span>5% / 3%</span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1 font-mono">
          {positionsCount} Active Long{positionsCount === 1 ? '' : 's'} Protected
        </div>
      </div>
    </div>
  );
};
