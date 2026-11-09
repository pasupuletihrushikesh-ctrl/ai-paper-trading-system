import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Layers, Sliders, Maximize2 } from 'lucide-react';

interface Props {
  ticker: string;
  historyData: any[];
  currentPrice: number;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  stopLoss?: number;
  takeProfit?: number;
  ema50?: number;
  ema200?: number;
  bbUpper?: number;
  bbLower?: number;
}

const TIMEFRAMES = ['1D', '5D', '1M', '3M', '1Y'];

export const PriceChart: React.FC<Props> = ({
  ticker,
  historyData,
  currentPrice,
  timeframe,
  onTimeframeChange,
  stopLoss,
  takeProfit,
  ema50,
  ema200,
  bbUpper,
  bbLower
}) => {
  const [showOverlays, setShowOverlays] = useState(true);

  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-6 h-80 flex flex-col items-center justify-center space-y-2">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-mono">Loading real-time market candles for {ticker}...</p>
      </div>
    );
  }

  const prices = historyData.map((d) => d.close || d.low || currentPrice);
  const minVal = Math.min(...prices) * 0.99;
  const maxVal = Math.max(...prices) * 1.01;

  return (
    <div className="bg-[#0e1422] border border-[#1b2438] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-xs font-bold font-mono text-white tracking-wider uppercase">
            {ticker} Market Telemetry
          </span>
          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            ${currentPrice > 0 ? currentPrice.toFixed(2) : prices[prices.length - 1]?.toFixed(2)}
          </span>
        </div>

        {/* Timeframe Buttons & Overlay Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-[#1b2438]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title="Toggle Stop Loss & Target Overlay Lines"
            className={`p-1.5 rounded-xl border text-xs transition ${
              showOverlays
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-[#090d16] border-[#1b2438] text-gray-500'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tvPriceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#161f33" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => typeof val === 'string' ? (val.length > 5 && !val.includes(':') ? val.slice(5) : val) : val}
              stroke="#475569"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              domain={[minVal, maxVal]}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
              stroke="#475569"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0b0f19] border border-[#1b2438] p-3 rounded-xl shadow-2xl text-xs font-mono">
                      <div className="text-gray-400 text-[10px] pb-1 border-b border-gray-800 mb-1.5 flex items-center justify-between">
                        <span>{data.timestamp}</span>
                        <span className="text-blue-400 font-bold">{ticker}</span>
                      </div>
                      <div className="text-white font-bold text-sm">Close: ${data.close?.toFixed(2)}</div>
                      {data.open && <div className="text-gray-400 text-[10px]">Open: ${data.open?.toFixed(2)}</div>}
                      {data.high && (
                        <div className="text-gray-400 text-[10px]">
                          High: ${data.high?.toFixed(2)} | Low: ${data.low?.toFixed(2)}
                        </div>
                      )}
                      {data.volume > 0 && (
                        <div className="text-gray-500 text-[10px] pt-1">
                          Vol: {data.volume.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#tvPriceGradient)"
            />

            {/* Overlays */}
            {showOverlays && stopLoss && stopLoss > 0 && (
              <ReferenceLine
                y={stopLoss}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: `SL $${stopLoss.toFixed(2)}`, fill: '#EF4444', fontSize: 10, position: 'insideRight' }}
              />
            )}

            {showOverlays && takeProfit && takeProfit > 0 && (
              <ReferenceLine
                y={takeProfit}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: `TP $${takeProfit.toFixed(2)}`, fill: '#10B981', fontSize: 10, position: 'insideRight' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Indicator Pill Strip */}
      <div className="pt-3 border-t border-[#1b2438] grid grid-cols-4 gap-2 text-center text-xs font-mono">
        <div className="bg-[#090d16] p-1.5 rounded-lg border border-[#1b2438]">
          <span className="text-gray-500 text-[10px] block">EMA 50</span>
          <span className="text-gray-300 font-semibold">{ema50 ? `$${ema50.toFixed(2)}` : '—'}</span>
        </div>
        <div className="bg-[#090d16] p-1.5 rounded-lg border border-[#1b2438]">
          <span className="text-gray-500 text-[10px] block">EMA 200</span>
          <span className="text-gray-300 font-semibold">{ema200 ? `$${ema200.toFixed(2)}` : '—'}</span>
        </div>
        <div className="bg-[#090d16] p-1.5 rounded-lg border border-[#1b2438]">
          <span className="text-gray-500 text-[10px] block">BB Upper</span>
          <span className="text-gray-300 font-semibold">{bbUpper ? `$${bbUpper.toFixed(2)}` : '—'}</span>
        </div>
        <div className="bg-[#090d16] p-1.5 rounded-lg border border-[#1b2438]">
          <span className="text-gray-500 text-[10px] block">BB Lower</span>
          <span className="text-gray-300 font-semibold">{bbLower ? `$${bbLower.toFixed(2)}` : '—'}</span>
        </div>
      </div>
    </div>
  );
};
