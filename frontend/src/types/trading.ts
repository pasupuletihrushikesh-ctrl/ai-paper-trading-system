export interface IndicatorData {
  rsi_14: number;
  macd_line: number;
  macd_signal: number;
  macd_hist: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  ema_50: number;
  ema_200: number;
}

export interface TechnicalSignal {
  ticker: string;
  current_price: number;
  indicators: IndicatorData;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal_strength: number;
  summary: string;
}

export interface SentimentItem {
  headline: string;
  publisher?: string;
  published_at?: string;
  sentiment_score: number;
}

export interface SentimentSignal {
  ticker: string;
  aggregate_score: number;
  sentiment_label: 'VERY_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY_BULLISH';
  confidence: number;
  headlines_analyzed: SentimentItem[];
  reasoning: string;
}

export interface ProposedTradeOrder {
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  current_price: number;
  target_allocation_pct: number;
  target_shares: number;
  stop_loss?: number;
  take_profit?: number;
  confidence: number;
  rationale: string;
}

export interface RiskCheckResult {
  rule_name: string;
  passed: boolean;
  details: string;
  threshold: any;
  actual_value: any;
}

export interface RiskDecision {
  approved: boolean;
  action_taken: 'APPROVED' | 'SCALED_DOWN' | 'REJECTED' | 'NO_ACTION';
  original_allocation_pct: number;
  approved_allocation_pct: number;
  approved_shares: number;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  confidence: number;
  checks: RiskCheckResult[];
  rejection_reasons: string[];
}

export interface ExecutionResult {
  order_id: string;
  status: 'FILLED' | 'REJECTED' | 'SKIPPED';
  action: string;
  shares: number;
  price: number;
  total_cost: number;
  execution_type: 'MOCK_EXCHANGE' | 'ALPACA_PAPER';
  message: string;
  timestamp: string;
}

export interface AgentExecutionTrace {
  run_id: string;
  ticker: string;
  timestamp: string;
  technical_signal: TechnicalSignal;
  sentiment_signal: SentimentSignal;
  strategist_proposal: ProposedTradeOrder;
  risk_decision: RiskDecision;
  execution_result?: ExecutionResult;
}

export interface Position {
  id: number;
  ticker: string;
  shares: number;
  avg_entry_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  stop_loss?: number;
  take_profit?: number;
  updated_at: string;
}

export interface TradeLog {
  id: number;
  run_id: string;
  ticker: string;
  action: string;
  shares: number;
  fill_price: number;
  notional_value: number;
  stop_loss?: number;
  take_profit?: number;
  risk_status: string;
  risk_reason?: string;
  execution_status: string;
  execution_type: string;
  created_at: string;
}

export interface PortfolioStatus {
  total_equity: number;
  cash_balance: number;
  daily_start_equity: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  win_rate: number;
  closed_trades_count: number;
  winning_trades_count: number;
  positions_count: number;
  positions: Position[];
  recent_trades: TradeLog[];
}
