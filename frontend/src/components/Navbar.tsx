import React from 'react';
import { Activity, ShieldCheck, Database, RefreshCw, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onRefresh: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, onReset, isLoading }) => {
  return (
    <header className="border-b border-gray-800 bg-[#0d131f]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">AGY Paper-Trading</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Multi-Agent v1.0
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">LangGraph Orchestration + Deterministic Risk Guardrail</p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>FastAPI 8000</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>SQLite</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardrail 5%/3%/2%</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onReset}
              title="Reset Portfolio to $100k Default"
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition flex items-center space-x-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition flex items-center space-x-1 text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
