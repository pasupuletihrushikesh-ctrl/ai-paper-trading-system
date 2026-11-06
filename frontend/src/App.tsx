import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PortfolioOverview } from './components/PortfolioOverview';
import { TickerControl } from './components/TickerControl';
import { AgentReasoningFeed } from './components/AgentReasoningFeed';
import { PriceChart } from './components/PriceChart';
import { PositionsTable } from './components/PositionsTable';
import { TradeLogTable } from './components/TradeLogTable';
import { apiClient } from './services/api';
import { PortfolioStatus, AgentExecutionTrace } from './types/trading';

export const App: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [portfolio, setPortfolio] = useState<PortfolioStatus | null>(null);
  const [latestTrace, setLatestTrace] = useState<AgentExecutionTrace | null>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
    }
  };

  const fetchMarketData = async (ticker: string) => {
    try {
      const data = await apiClient.getMarketData(ticker);
      setMarketData(data);
    } catch (err: any) {
      console.error(`Failed to load market data for ${ticker}:`, err);
    }
  };

  const fetchRecentTraces = async () => {
    try {
      const traces = await apiClient.getRecentTraces();
      if (traces && traces.length > 0) {
        setLatestTrace(traces[0]);
      }
    } catch (err: any) {
      console.error('Failed to load recent traces:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchMarketData(selectedTicker);
    fetchRecentTraces();
  }, []);

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    fetchMarketData(ticker);
  };

  const handleRunCycle = async (ticker: string, forceAction?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const trace = await apiClient.runAgentCycle(ticker, forceAction);
      setLatestTrace(trace);
      await fetchPortfolio();
      await fetchMarketData(ticker);
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPortfolio = async () => {
    if (window.confirm('Reset portfolio back to initial $100,000.00 cash balance?')) {
      try {
        await apiClient.resetPortfolio();
        await fetchPortfolio();
        setLatestTrace(null);
      } catch (err: any) {
        alert('Reset failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col">
      <Navbar
        isLoading={isLoading}
        onRefresh={() => {
          fetchPortfolio();
          fetchMarketData(selectedTicker);
          fetchRecentTraces();
        }}
        onReset={handleResetPortfolio}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {/* 1. Portfolio Telemetry KPIs */}
        <PortfolioOverview portfolio={portfolio} />

        {/* 2. Ticker Selection & Trigger Control */}
        <TickerControl
          selectedTicker={selectedTicker}
          onSelectTicker={handleSelectTicker}
          onRunCycle={handleRunCycle}
          isLoading={isLoading}
        />

        {/* 3. Market Chart & Agent Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <AgentReasoningFeed trace={latestTrace} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <PriceChart
              ticker={selectedTicker}
              historyData={marketData?.indicators?.raw_history || []}
              currentPrice={marketData?.indicators?.current_price || latestTrace?.technical_signal?.current_price || 0}
              stopLoss={latestTrace?.risk_decision?.stop_loss}
              takeProfit={latestTrace?.risk_decision?.take_profit}
              ema50={marketData?.indicators?.ema_50}
              ema200={marketData?.indicators?.ema_200}
            />

            {/* Quick Tech Snapshot */}
            {marketData?.indicators && (
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 text-xs font-mono">
                <span className="text-gray-400 font-bold block mb-2 text-[10px] uppercase tracking-wider">
                  Live Indicators ({selectedTicker})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">
                    <span className="text-gray-500 text-[10px] block">BB Upper</span>
                    <span className="text-gray-300">${marketData.indicators.bb_upper}</span>
                  </div>
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">
                    <span className="text-gray-500 text-[10px] block">BB Middle</span>
                    <span className="text-gray-300">${marketData.indicators.bb_middle}</span>
                  </div>
                  <div className="bg-gray-900 p-2 rounded border border-gray-800">
                    <span className="text-gray-500 text-[10px] block">BB Lower</span>
                    <span className="text-gray-300">${marketData.indicators.bb_lower}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Tabbed Portfolio Data Tables */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'positions'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active Holdings ({portfolio?.positions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'trades'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Audit Trade Logs ({portfolio?.recent_trades?.length || 0})
            </button>
          </div>

          {activeTab === 'positions' ? (
            <PositionsTable positions={portfolio?.positions || []} />
          ) : (
            <TradeLogTable trades={portfolio?.recent_trades || []} />
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-500 font-mono">
        AGY Multi-Agent Algorithmic Paper-Trading & Risk Guardrail System &copy; 2026
      </footer>
    </div>
  );
};
export default App;
