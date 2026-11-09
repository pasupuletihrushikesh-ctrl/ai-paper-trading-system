import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Newspaper, 
  BrainCircuit, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { AgentExecutionTrace } from '../types/trading';

interface Props {
  trace: AgentExecutionTrace | null;
  isLoading: boolean;
}

export const AgentReasoningFeed: React.FC<Props> = ({ trace, isLoading }) => {
  const [pipelineStep, setPipelineStep] = useState(1);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setPipelineStep(1);
      interval = setInterval(() => {
        setPipelineStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 700);
    } else {
      setPipelineStep(4);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    const steps = [
      { id: 1, title: 'Technical Analyst', desc: 'Calculating live RSI (14), MACD (12,26,9), Bollinger Bands & EMAs' },
      { id: 2, title: 'Sentiment & News Analyst', desc: 'Fetching market headlines & running NLP sentiment scoring' },
      { id: 3, title: 'Portfolio Strategist', desc: 'Synthesizing multi-factor directional score & proposed allocation' },
      { id: 4, title: 'Deterministic Risk Guardrail', desc: 'Validating 5% max size, <=3% SL, 2% drawdown & liquid cash' }
    ];

    return (
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">LangGraph Pipeline In Flight</h3>
            <p className="text-xs text-gray-400 font-mono">Autonomous Multi-Agent Consensus Loop</p>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {steps.map((st) => {
            const isActive = pipelineStep === st.id;
            const isDone = pipelineStep > st.id;

            return (
              <div 
                key={st.id}
                className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isActive 
                    ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                    : isDone
                    ? 'bg-[#090d16] border-emerald-500/30 text-emerald-300'
                    : 'bg-[#090d16] border-[#1b2438] text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone 
                      ? 'bg-emerald-500 text-black' 
                      : isActive 
                      ? 'bg-blue-600 text-white animate-pulse' 
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isDone ? '✓' : st.id}
                  </div>
                  <div>
                    <span className="font-bold block text-xs">{st.title}</span>
                    <span className="text-[11px] text-gray-400 block font-sans">{st.desc}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-8 text-center shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h3 className="text-white font-bold text-sm">Awaiting Autonomous Cycle</h3>
        <p className="text-gray-400 text-xs max-w-md mx-auto font-mono">
          Select a ticker and click &quot;Run Agent Cycle&quot; to inspect real-time technicals, sentiment scoring, and deterministic risk guardrails.
        </p>
      </div>
    );
  }

  const { technical_signal: tech, sentiment_signal: sent, strategist_proposal: strat, risk_decision: risk, execution_result: exec } = trace;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Autonomous Reasoning Trace ({trace.ticker})
          </h2>
        </div>
        <div className="text-[11px] font-mono text-gray-400">
          Run ID: <span className="text-blue-400 font-semibold">{trace.run_id}</span>
        </div>
      </div>

      {/* 4 Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node 1: Technical Analyst */}
        <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">1. Technical Analyst</h3>
                  <p className="text-[10px] text-gray-400">Multi-Factor Trend Synthesis</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                tech.trend === 'BULLISH'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : tech.trend === 'BEARISH'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {tech.trend} ({Math.round(tech.signal_strength * 100)}%)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3">
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">RSI (14)</span>
                <span className={`font-bold ${tech.indicators.rsi_14 > 70 ? 'text-rose-400' : tech.indicators.rsi_14 < 30 ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {tech.indicators.rsi_14.toFixed(1)}
                </span>
              </div>
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">MACD Hist</span>
                <span className={`font-bold ${tech.indicators.macd_hist >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tech.indicators.macd_hist >= 0 ? '+' : ''}{tech.indicators.macd_hist.toFixed(2)}
                </span>
              </div>
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">EMA 50/200</span>
                <span className="font-bold text-gray-200 text-[11px]">
                  ${tech.indicators.ema_50.toFixed(0)} / ${tech.indicators.ema_200.toFixed(0)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-mono bg-[#090d16]/60 p-2.5 rounded-xl border border-[#1b2438]">
              {tech.summary}
            </p>
          </div>
        </div>

        {/* Node 2: Sentiment Analyst */}
        <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">2. Sentiment Analyst</h3>
                  <p className="text-[10px] text-gray-400">Headline NLP Scoring [-1.0, +1.0]</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                sent.aggregate_score > 0.1
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : sent.aggregate_score < -0.1
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}>
                {sent.sentiment_label} ({sent.aggregate_score >= 0 ? '+' : ''}{sent.aggregate_score.toFixed(2)})
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span>Bearish (-1.0)</span>
                <span className="text-white font-bold">Score: {sent.aggregate_score.toFixed(2)}</span>
                <span>Bullish (+1.0)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800 relative overflow-hidden">
                <div 
                  className={`h-full ${sent.aggregate_score >= 0 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`}
                  style={{ width: `${((sent.aggregate_score + 1.0) / 2.0) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {sent.headlines_analyzed.slice(0, 2).map((item, i) => (
                <div key={i} className="text-[11px] bg-[#090d16] p-2 rounded-lg border border-[#1b2438] flex items-start justify-between gap-2">
                  <span className="text-gray-300 line-clamp-1">{item.headline}</span>
                  <span className={`font-mono text-[10px] font-bold shrink-0 ${item.sentiment_score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.sentiment_score >= 0 ? '+' : ''}{item.sentiment_score.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic font-mono line-clamp-1">
            {sent.reasoning}
          </p>
        </div>

        {/* Node 3: Portfolio Strategist */}
        <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">3. Portfolio Strategist</h3>
                  <p className="text-[10px] text-gray-400">Signal Synthesis & Order Sizing</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                strat.action === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : strat.action === 'SELL'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}>
                Proposed: {strat.action}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-mono mb-3">
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">Alloc %</span>
                <span className="font-bold text-white">{(strat.target_allocation_pct * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">Shares</span>
                <span className="font-bold text-white">{strat.target_shares}</span>
              </div>
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">Stop Loss</span>
                <span className="font-bold text-rose-400">{strat.stop_loss ? `$${strat.stop_loss.toFixed(2)}` : 'N/A'}</span>
              </div>
              <div className="bg-[#090d16] p-2 rounded-xl border border-[#1b2438]">
                <span className="text-gray-500 text-[10px] block">Confidence</span>
                <span className={`font-bold ${strat.confidence >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {(strat.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-mono bg-[#090d16]/60 p-2.5 rounded-xl border border-[#1b2438]">
              {strat.rationale}
            </p>
          </div>
        </div>

        {/* Node 4: Deterministic Risk Guardrail */}
        <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">4. Risk Guardrail</h3>
                  <p className="text-[10px] text-gray-400">Deterministic Pure Python Validation</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                risk.action_taken === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : risk.action_taken === 'SCALED_DOWN'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {risk.action_taken}
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-1 mb-3 font-mono text-[11px]">
              {risk.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#090d16] p-1.5 px-2.5 rounded-lg border border-[#1b2438]">
                  <div className="flex items-center space-x-2">
                    {chk.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-gray-300 text-[10px]">{chk.rule_name}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${chk.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {chk.passed ? 'PASS' : 'BLOCKED'}
                  </span>
                </div>
              ))}
            </div>

            {risk.approved ? (
              <div className="text-xs bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 p-2 rounded-xl flex items-center justify-between font-mono">
                <span>Approved: <strong>{risk.approved_shares} shs</strong> ({(risk.approved_allocation_pct * 100).toFixed(1)}% equity)</span>
                <span className="text-[10px]">SL: ${risk.stop_loss?.toFixed(2)}</span>
              </div>
            ) : (
              <div className="text-xs bg-rose-950/30 border border-rose-500/30 text-rose-300 p-2 rounded-xl font-mono">
                <strong>Rejection Reason:</strong> {risk.rejection_reasons.join('; ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Receipt Banner */}
      {exec && (
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
          exec.status === 'FILLED'
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : exec.status === 'REJECTED'
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            : 'bg-[#090d16] border-[#1b2438] text-gray-300'
        }`}>
          <div className="flex items-center space-x-2.5">
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
              exec.status === 'FILLED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
            }`}>
              {exec.status}
            </span>
            <span>{exec.message}</span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center space-x-2">
            <span>Route: <strong className="text-white">{exec.execution_type}</strong></span>
            <span>•</span>
            <span>Order ID: <strong className="text-blue-400">{exec.order_id}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
