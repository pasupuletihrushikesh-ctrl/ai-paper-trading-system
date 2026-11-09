import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  RefreshCw, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Zap,
  Globe
} from 'lucide-react';
import { CredentialsStatus } from '../types/trading';

interface NavbarProps {
  onRefresh: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  isLoading: boolean;
  credentials: CredentialsStatus | null;
  marketStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  onReset,
  onOpenSettings,
  isPrivacyMode,
  onTogglePrivacy,
  isAutoRefresh,
  onToggleAutoRefresh,
  isLoading,
  credentials,
  marketStatus = 'MARKET OPEN'
}) => {
  const isAlpacaConnected = credentials?.alpaca_connection?.connected;

  return (
    <header className="border-b border-[#1b2438] bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & System Status */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0d131f] rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                AGY Multi-Agent Trading
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO TERMINAL
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono flex items-center space-x-2">
              <span>LangGraph Orchestration</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400/90">Pure Python Risk Guardrail</span>
            </p>
          </div>
        </div>

        {/* Global Status Badges & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Market Session Status */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0f1624] border border-[#1b2438] text-xs font-mono text-gray-300">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{marketStatus}</span>
          </div>

          {/* Alpaca API Status Pill */}
          <button
            onClick={onOpenSettings}
            title="Click to configure Alpaca Paper API Keys & Environment"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 ${
              isAlpacaConnected
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:bg-amber-900/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAlpacaConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="font-semibold">
              {isAlpacaConnected ? 'Alpaca Live Paper' : 'Mock Exchange (Local)'}
            </span>
          </button>

          {/* Privacy Mode Toggle */}
          <button
            onClick={onTogglePrivacy}
            title={isPrivacyMode ? 'Disable Privacy Mode (Show Balances)' : 'Enable Privacy Mode (Mask Balances)'}
            className={`p-2 rounded-xl border text-xs transition flex items-center space-x-1.5 ${
              isPrivacyMode
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-[#0f1624] hover:bg-[#151e30] border-[#1b2438] text-gray-300'
            }`}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
            <span className="hidden md:inline font-mono text-[11px] font-medium">
              {isPrivacyMode ? 'Privacy Active' : 'Privacy'}
            </span>
          </button>

          {/* Live Auto-Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            title={isAutoRefresh ? 'Auto-refresh every 5s is ON' : 'Auto-refresh is paused'}
            className={`p-2 rounded-xl border text-xs transition flex items-center space-x-1.5 ${
              isAutoRefresh
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-[#0f1624] hover:bg-[#151e30] border-[#1b2438] text-gray-400'
            }`}
          >
            <Zap className={`w-4 h-4 ${isAutoRefresh ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden md:inline font-mono text-[11px]">
              {isAutoRefresh ? 'Live (5s)' : 'Paused'}
            </span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Configure Alpaca Credentials & System Settings"
            className="p-2 rounded-xl bg-[#0f1624] hover:bg-[#151e30] border border-[#1b2438] text-gray-300 hover:text-white transition"
          >
            <SettingsIcon className="w-4 h-4 text-gray-300 hover:text-blue-400" />
          </button>

          {/* Reset Portfolio */}
          <button
            onClick={onReset}
            title="Reset Portfolio to $100k Default"
            className="p-2 rounded-xl bg-[#0f1624] hover:bg-[#151e30] border border-[#1b2438] text-gray-300 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
