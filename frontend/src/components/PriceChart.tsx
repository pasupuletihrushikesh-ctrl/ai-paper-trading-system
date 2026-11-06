import React from 'react';
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
import { TrendingUp, Clock } from 'lucide-react';

interface Props {
  ticker: string;
  historyData: any[];
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  ema50?: number;
  ema200?: number;
}

export const PriceChart: React.FC<Props> = ({
  ticker,
  historyData,
  currentPrice,
  stopLoss,
  takeProfit,
  ema50,
  ema200
}) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 h-72 flex items-center justify-center">
        <p className="text-gray-500 text-xs font-mono">No historical price bars available.</p>
      </div>
    );
  }

  const minPrice = Math.min(...historyData.map(d => d.low || d.close)) * 0.98;
  const maxPrice = Math.max(...historyData.map(d => d.high || d.close)) * 1.02;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{ticker} Market Chart</span>
          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            ${currentPrice?.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-400">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-blue-400 inline-block"></span>
            <span>Price</span>
          </span>
          {stopLoss && (
            <span className="flex items-center space-x-1 text-red-400">
              <span className="w-2.5 h-0.5 bg-red-400 inline-block border-b border-dashed"></span>
              <span>SL ${stopLoss.toFixed(2)}</span>
            </span>
          )}
          {takeProfit && (
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block border-b border-dashed"></span>
              <span>TP ${takeProfit.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => typeof val === 'string' ? val.slice(5) : val}
              stroke="#4B5563"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
              stroke="#4B5563"
              fontSize={10}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 border border-gray-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                      <div className="text-gray-400 text-[10px] mb-1">{data.timestamp}</div>
                      <div className="text-white font-bold">Close: ${data.close?.toFixed(2)}</div>
                      {data.high && <div className="text-gray-400 text-[10px]">High: ${data.high?.toFixed(2)} | Low: ${data.low?.toFixed(2)}</div>}
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
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />

            {stopLoss && (
              <ReferenceLine
                y={stopLoss}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: 'SL', fill: '#EF4444', fontSize: 10, position: 'right' }}
              />
            )}

            {takeProfit && (
              <ReferenceLine
                y={takeProfit}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'TP', fill: '#10B981', fontSize: 10, position: 'right' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
