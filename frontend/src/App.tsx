import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { TickerTape } from './components/TickerTape';
import { PortfolioOverview } from './components/PortfolioOverview';
import { TickerControl } from './components/TickerControl';
import { AgentReasoningFeed } from './components/AgentReasoningFeed';
import { PriceChart } from './components/PriceChart';
import { PositionsTable } from './components/PositionsTable';
import { TradeLogTable } from './components/TradeLogTable';
import { SettingsModal } from './components/SettingsModal';
import { apiClient } from './services/api';
import { 
  PortfolioStatus, 
  AgentExecutionTrace, 
  MarketDataResponse, 
  LiveQuote,
  CredentialsStatus
} from './types/trading';

export const App: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [portfolio, setPortfolio] = useState<PortfolioStatus | null>(null);
  const [latestTrace, setLatestTrace] = useState<AgentExecutionTrace | null>(null);
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [currentQuote, setCurrentQuote] = useState<LiveQuote | null>(null);
  const [watchlist, setWatchlist] = useState<LiveQuote[]>([]);
  const [credentials, setCredentials] = useState<CredentialsStatus | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdatingFeed, setIsUpdatingFeed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial portfolio
  const fetchPortfolio = async () => {
    try {
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
    }
  };

  // Load market data for chart & indicators
  const fetchMarketData = async (ticker: string, tf: string = timeframe) => {
    try {
      const data = await apiClient.getMarketData(ticker, tf);
      setMarketData(data);
      if (data.quote) {
        setCurrentQuote(data.quote);
      }
    } catch (err: any) {
      console.error(`Failed to load market data for ${ticker}:`, err);
    }
  };

  // Load watchlist live quotes
  const fetchWatchlist = async () => {
    setIsUpdatingFeed(true);
    try {
      const quotes = await apiClient.getWatchlist();
      setWatchlist(quotes);
      const activeMatch = quotes.find(q => q.ticker === selectedTicker);
      if (activeMatch) {
        setCurrentQuote(activeMatch);
      }
    } catch (err: any) {
      console.error('Failed to update watchlist:', err);
    } finally {
      setIsUpdatingFeed(false);
    }
  };

  // Load recent agent trace
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

  // Load credentials status
  const fetchCredentials = async () => {
    try {
      const data = await apiClient.getCredentialsStatus();
      setCredentials(data);
    } catch (err: any) {
      console.error('Failed to load credentials status:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchMarketData(selectedTicker, timeframe);
    fetchWatchlist();
    fetchRecentTraces();
    fetchCredentials();
  }, []);

  // Auto-refresh interval (5s) for live market data
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchWatchlist();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, selectedTicker]);

  const handleSelectTicker = (ticker: string) => {
    const clean = ticker.toUpperCase().trim();
    setSelectedTicker(clean);
    fetchMarketData(clean, timeframe);
  };

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    fetchMarketData(selectedTicker, tf);
  };

  const handleRunCycle = async (ticker: string, forceAction?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const trace = await apiClient.runAgentCycle(ticker, forceAction);
      setLatestTrace(trace);
      await fetchPortfolio();
      await fetchMarketData(ticker, timeframe);
      
      if (trace.execution_result) {
        setToastMessage(`${trace.execution_result.status}: ${trace.execution_result.message}`);
        setTimeout(() => setToastMessage(null), 6000);
      }
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLiquidate = (ticker: string) => {
    if (window.confirm(`Liquidate full position in ${ticker}?`)) {
      handleRunCycle(ticker, 'SELL');
    }
  };

  const handleResetPortfolio = async () => {
    if (window.confirm('Reset portfolio back to initial $100,000.00 cash balance?')) {
      try {
        await apiClient.resetPortfolio();
        await fetchPortfolio();
        setLatestTrace(null);
        setToastMessage('Portfolio reset back to $100,000.00 cash balance.');
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err: any) {
        alert('Reset failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Top Navbar */}
      <Navbar
        isLoading={isLoading}
        onRefresh={() => {
          fetchPortfolio();
          fetchMarketData(selectedTicker, timeframe);
          fetchWatchlist();
          fetchRecentTraces();
          fetchCredentials();
        }}
        onReset={handleResetPortfolio}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
        isAutoRefresh={isAutoRefresh}
        onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
        credentials={credentials}
        marketStatus={currentQuote?.market_status}
      />

      {/* 2. Live Streaming Ticker Tape Banner */}
      <TickerTape
        watchlist={watchlist}
        selectedTicker={selectedTicker}
        onSelectTicker={handleSelectTicker}
        isUpdating={isUpdatingFeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono shadow-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-mono shadow-xl flex items-center justify-between">
            <div>
              <strong className="text-rose-200">Execution Notice:</strong> {errorMessage}
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 3. Portfolio Telemetry Cards */}
        <PortfolioOverview portfolio={portfolio} isPrivacyMode={isPrivacyMode} />

        {/* 4. Ticker Control & Live Quote Banner */}
        <TickerControl
          selectedTicker={selectedTicker}
          onSelectTicker={handleSelectTicker}
          onRunCycle={handleRunCycle}
          isLoading={isLoading}
          currentQuote={currentQuote}
        />

        {/* 5. Main 2-Column Split: Interactive Chart & Multi-Agent Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Chart & Quick Stats (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <PriceChart
              ticker={selectedTicker}
              historyData={marketData?.indicators?.raw_history || []}
              currentPrice={currentQuote?.current_price || marketData?.indicators?.current_price || 0}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              stopLoss={latestTrace?.risk_decision?.stop_loss}
              takeProfit={latestTrace?.risk_decision?.take_profit}
              ema50={marketData?.indicators?.ema_50}
              ema200={marketData?.indicators?.ema_200}
              bbUpper={marketData?.indicators?.bb_upper}
              bbLower={marketData?.indicators?.bb_lower}
            />
          </div>

          {/* Right Column: Multi-Agent Reasoning Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <AgentReasoningFeed trace={latestTrace} isLoading={isLoading} />
          </div>
        </div>

        {/* 6. Bottom Tabbed Tables (Active Holdings & Trade Logs) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 border-b border-[#1b2438] pb-2.5">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                activeTab === 'positions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200 bg-[#090d16] border border-[#1b2438]'
              }`}
            >
              Active Positions ({portfolio?.positions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                activeTab === 'trades'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200 bg-[#090d16] border border-[#1b2438]'
              }`}
            >
              Audit Trade Logs ({portfolio?.recent_trades?.length || 0})
            </button>
          </div>

          {activeTab === 'positions' ? (
            <PositionsTable 
              positions={portfolio?.positions || []} 
              onLiquidate={handleLiquidate}
              isPrivacyMode={isPrivacyMode} 
            />
          ) : (
            <TradeLogTable 
              trades={portfolio?.recent_trades || []} 
              isPrivacyMode={isPrivacyMode} 
            />
          )}
        </div>
      </main>

      {/* 7. Settings & Credentials Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credentials={credentials}
        onCredentialsUpdated={() => {
          fetchCredentials();
          fetchPortfolio();
        }}
      />

      <footer className="border-t border-[#1b2438] py-4 text-center text-xs text-gray-500 font-mono bg-[#090d16]/80 mt-6">
        AGY Multi-Agent Algorithmic Paper-Trading & Risk Guardrail System &copy; 2026 • Local & Private
      </footer>
    </div>
  );
};

export default App;
