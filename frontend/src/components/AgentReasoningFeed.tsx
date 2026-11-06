import React from 'react';
import { 
  BarChart2, 
  Newspaper, 
  BrainCircuit, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { AgentExecutionTrace } from '../types/trading';

interface Props {
  trace: AgentExecutionTrace | null;
  isLoading: boolean;
}

export const AgentReasoningFeed: React.FC<Props> = ({ trace, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-white font-semibold text-base mb-1">Multi-Agent State Graph In Flight</h3>
        <p className="text-gray-400 text-xs font-mono max-w-md mx-auto">
          Sequencing: Technical Analyst ➔ Sentiment Analyst ➔ Portfolio Strategist ➔ Deterministic Risk Engine
        </p>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center shadow-sm">
        <BrainCircuit className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-gray-300 font-semibold text-sm mb-1">Awaiting Agent Run</h3>
        <p className="text-gray-500 text-xs max-w-sm mx-auto">
          Select a ticker above and click &quot;Run Agent Cycle&quot; to inspect the multi-agent reasoning trace.
        </p>
      </div>
    );
  }

  const { technical_signal: tech, sentiment_signal: sent, strategist_proposal: strat, risk_decision: risk, execution_result: exec } = trace;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Agent Reasoning Feed</h2>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Run ID: <span className="text-gray-200">{trace.run_id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node 1: Technical Analyst */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">1. Technical Analyst</h3>
                  <p className="text-[10px] text-gray-400">OHLCV & Multi-Indicator Analysis</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                tech.trend === 'BULLISH'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : tech.trend === 'BEARISH'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {tech.trend} ({Math.round(tech.signal_strength * 100)}%)
              </span>
            </div>

            {/* Indicator Pills */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3">
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">RSI (14)</span>
                <span className={`font-semibold ${tech.indicators.rsi_14 > 70 ? 'text-red-400' : tech.indicators.rsi_14 < 30 ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {tech.indicators.rsi_14.toFixed(1)}
                </span>
              </div>
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">MACD Hist</span>
                <span className={`font-semibold ${tech.indicators.macd_hist >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tech.indicators.macd_hist >= 0 ? '+' : ''}{tech.indicators.macd_hist.toFixed(2)}
                </span>
              </div>
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">EMA 50 / 200</span>
                <span className="font-semibold text-gray-200 text-[11px]">
                  ${tech.indicators.ema_50.toFixed(0)} / ${tech.indicators.ema_200.toFixed(0)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans bg-gray-900/40 p-2.5 rounded-lg border border-gray-800/80">
              {tech.summary}
            </p>
          </div>
        </div>

        {/* Node 2: Sentiment Analyst */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">2. Sentiment & News Analyst</h3>
                  <p className="text-[10px] text-gray-400">NLP Scoring & Headline Synthesis</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                sent.aggregate_score > 0.1
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : sent.aggregate_score < -0.1
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}>
                {sent.sentiment_label} ({sent.aggregate_score >= 0 ? '+' : ''}{sent.aggregate_score.toFixed(2)})
              </span>
            </div>

            {/* Score Bar Meter */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span>Bearish (-1.0)</span>
                <span>Score: {sent.aggregate_score.toFixed(2)}</span>
                <span>Bullish (+1.0)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800 relative overflow-hidden">
                <div 
                  className={`h-full ${sent.aggregate_score >= 0 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-amber-500'}`}
                  style={{ width: `${((sent.aggregate_score + 1.0) / 2.0) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {sent.headlines_analyzed.slice(0, 2).map((item, i) => (
                <div key={i} className="text-[11px] bg-gray-900/60 p-2 rounded border border-gray-800 flex items-start justify-between gap-2">
                  <span className="text-gray-300 line-clamp-1">{item.headline}</span>
                  <span className={`font-mono text-[10px] font-semibold shrink-0 ${item.sentiment_score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.sentiment_score >= 0 ? '+' : ''}{item.sentiment_score.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic line-clamp-1">
            {sent.reasoning}
          </p>
        </div>

        {/* Node 3: Portfolio Strategist */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">3. Portfolio Strategist</h3>
                  <p className="text-[10px] text-gray-400">Signal Synthesis & Order Proposal</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                strat.action === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : strat.action === 'SELL'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}>
                Proposed: {strat.action}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-3">
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">Target Alloc</span>
                <span className="font-semibold text-white">
                  {(strat.target_allocation_pct * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">Target Shares</span>
                <span className="font-semibold text-white">{strat.target_shares} shs</span>
              </div>
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">Stop Loss</span>
                <span className="font-semibold text-red-400">
                  {strat.stop_loss ? `$${strat.stop_loss.toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] block">Confidence</span>
                <span className={`font-semibold ${strat.confidence >= 0.70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {(strat.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 bg-gray-900/40 p-2.5 rounded-lg border border-gray-800/80">
              {strat.rationale}
            </p>
          </div>
        </div>

        {/* Node 4: Deterministic Risk Manager */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">4. Deterministic Risk Guardrail</h3>
                  <p className="text-[10px] text-gray-400">Pure Python Validation (NO LLM)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                risk.action_taken === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : risk.action_taken === 'SCALED_DOWN'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {risk.action_taken}
              </span>
            </div>

            {/* Guardrail Checklist */}
            <div className="space-y-1.5 mb-3 font-mono text-[11px]">
              {risk.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-900/60 p-1.5 px-2.5 rounded border border-gray-800">
                  <div className="flex items-center space-x-2">
                    {chk.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span className="text-gray-300 text-[10px]">{chk.rule_name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${chk.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {chk.passed ? 'PASS' : 'BLOCKED'}
                  </span>
                </div>
              ))}
            </div>

            {/* Approved Trade specs or Rejection reason */}
            {risk.approved ? (
              <div className="text-xs bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-lg flex items-center justify-between">
                <span>Approved: <strong>{risk.approved_shares} shares</strong> ({(risk.approved_allocation_pct * 100).toFixed(1)}% equity)</span>
                <span className="text-[10px] font-mono">SL: ${risk.stop_loss?.toFixed(2)}</span>
              </div>
            ) : (
              <div className="text-xs bg-red-950/30 border border-red-500/30 text-red-300 p-2.5 rounded-lg">
                <span className="font-semibold block mb-0.5">Guardrail Rejection:</span>
                <span className="text-[11px]">{risk.rejection_reasons.join('; ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Summary Bar */}
      {exec && (
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
          exec.status === 'FILLED'
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : exec.status === 'REJECTED'
            ? 'bg-red-950/30 border-red-500/30 text-red-300'
            : 'bg-gray-900 border-gray-800 text-gray-400'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase px-2 py-0.5 rounded bg-black/40">
              {exec.status}
            </span>
            <span>{exec.message}</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Order: {exec.order_id} | Via {exec.execution_type}
          </div>
        </div>
      )}
    </div>
  );
};
