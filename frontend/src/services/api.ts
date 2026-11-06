import axios from 'axios';
import { PortfolioStatus, AgentExecutionTrace, TradeLog } from '../types/trading';

const API_BASE = '/api';

export const apiClient = {
  async getPortfolio(): Promise<PortfolioStatus> {
    const res = await axios.get<PortfolioStatus>(`${API_BASE}/portfolio`);
    return res.data;
  },

  async resetPortfolio(): Promise<{ status: string; message: string }> {
    const res = await axios.post(`${API_BASE}/portfolio/reset`);
    return res.data;
  },

  async runAgentCycle(ticker: string, forceAction?: string): Promise<AgentExecutionTrace> {
    const res = await axios.post<AgentExecutionTrace>(`${API_BASE}/trading/run-cycle`, {
      ticker: ticker.toUpperCase(),
      force_action: forceAction || null
    });
    return res.data;
  },

  async getRecentTraces(): Promise<AgentExecutionTrace[]> {
    const res = await axios.get<AgentExecutionTrace[]>(`${API_BASE}/trading/traces`);
    return res.data;
  },

  async getTradeLogs(): Promise<TradeLog[]> {
    const res = await axios.get<TradeLog[]>(`${API_BASE}/trading/trades`);
    return res.data;
  },

  async getMarketData(ticker: string): Promise<any> {
    const res = await axios.get(`${API_BASE}/market/${ticker.toUpperCase()}`);
    return res.data;
  }
};
