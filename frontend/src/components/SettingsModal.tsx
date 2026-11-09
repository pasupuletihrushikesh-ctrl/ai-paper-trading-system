import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff, 
  Lock, 
  FolderLock
} from 'lucide-react';
import { apiClient } from '../services/api';
import { CredentialsStatus } from '../types/trading';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  credentials: CredentialsStatus | null;
  onCredentialsUpdated: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  credentials,
  onCredentialsUpdated
}) => {
  const [alpacaKey, setAlpacaKey] = useState('');
  const [alpacaSecret, setAlpacaSecret] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (credentials) {
      if (credentials.alpaca_connection) {
        setTestResult(credentials.alpaca_connection);
      }
    }
  }, [credentials]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const result = await apiClient.testAlpacaConnection(
        alpacaKey.trim() || undefined,
        alpacaSecret.trim() || undefined
      );
      setTestResult(result);
      if (result.connected) {
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setTestResult({ connected: false, message: err.message || 'Connection test failed' });
      setStatusMessage({ type: 'error', text: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const payload: any = {};
      if (alpacaKey.trim()) payload.alpaca_api_key = alpacaKey.trim();
      if (alpacaSecret.trim()) payload.alpaca_secret_key = alpacaSecret.trim();
      if (geminiKey.trim()) payload.gemini_api_key = geminiKey.trim();

      const res = await apiClient.updateCredentials(payload);
      setTestResult(res.alpaca_connection);
      setStatusMessage({ type: 'success', text: res.message });
      setAlpacaKey('');
      setAlpacaSecret('');
      setGeminiKey('');
      onCredentialsUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message || 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0d131f] border border-[#1b2438] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1b2438] flex items-center justify-between bg-[#0a0e17]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Alpaca Paper Trading & Security</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  Encrypted Local Config
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Manage API keys and real-time execution routing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Privacy & File Location Banner */}
          <div className="bg-[#111927] border border-blue-500/20 rounded-xl p-4 text-xs font-mono">
            <div className="flex items-start space-x-3">
              <FolderLock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-white block">Local Credentials Storage:</span>
                <code className="text-[11px] bg-black/40 px-2 py-1 rounded text-blue-300 block break-all border border-blue-500/10">
                  {credentials?.env_path || 'C:\\Users\\pasup\\Vs Code Projects\\ai-paper-trading-system\\.env'}
                </code>
                <p className="text-[11px] text-gray-400 pt-1">
                  ✓ Protected: This file is excluded by <span className="text-gray-300">.gitignore</span> and is never uploaded to GitHub or exposed over client bundles.
                </p>
              </div>
            </div>
          </div>

          {/* Alpaca Connection Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            testResult?.connected
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-start space-x-2.5">
              {testResult?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs">
                    {testResult?.connected ? 'Alpaca Live Paper API: ACTIVE' : 'Execution Mode: Local SQLite Mock Exchange'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {testResult?.message || 'Using local zero-risk SQLite Mock Exchange ($100k simulated capital).'}
                </p>
                {testResult?.connected && testResult?.buying_power !== undefined && (
                  <div className="flex items-center space-x-3 mt-2 text-[11px] font-mono text-emerald-200">
                    <span>Buying Power: <strong>${testResult.buying_power.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                    <span>Portfolio: <strong>${testResult.portfolio_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                )}
              </div>
            </div>
            <a 
              href="https://app.alpaca.markets/paper/dashboard/overview" 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-mono flex items-center space-x-1.5 self-start sm:self-center shrink-0 border border-gray-700"
            >
              <span>Get Alpaca Keys</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Alpaca API Key ID (Starts with PK...)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={credentials?.alpaca_key_masked ? `Configured: ${credentials.alpaca_key_masked}` : 'Enter your Alpaca Paper API Key'}
                  value={alpacaKey}
                  onChange={(e) => setAlpacaKey(e.target.value)}
                  className="w-full bg-[#080d17] border border-[#1b2438] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Alpaca Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder={credentials?.alpaca_secret_set ? '••••••••••••••••••••••••••••••••' : 'Enter your Alpaca Secret Key'}
                  value={alpacaSecret}
                  onChange={(e) => setAlpacaSecret(e.target.value)}
                  className="w-full bg-[#080d17] border border-[#1b2438] focus:border-blue-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Google Gemini API Key (Optional — for deep news NLP reasoning)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={credentials?.gemini_key_masked ? `Configured: ${credentials.gemini_key_masked}` : 'Optional Gemini API Key'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#080d17] border border-[#1b2438] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs font-mono ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
              }`}>
                {statusMessage.text}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1b2438]">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs transition flex items-center space-x-2 border border-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-400' : ''}`} />
                <span>Test Live Connection</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-gray-800 text-gray-400 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Credentials to .env</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
