from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime

class IndicatorData(BaseModel):
    rsi_14: float
    macd_line: float
    macd_signal: float
    macd_hist: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    ema_50: float
    ema_200: float

class TechnicalSignal(BaseModel):
    ticker: str
    current_price: float
    indicators: IndicatorData
    trend: Literal["BULLISH", "BEARISH", "NEUTRAL"]
    signal_strength: float = Field(ge=0.0, le=1.0)
    summary: str

class SentimentItem(BaseModel):
    headline: str
    publisher: Optional[str] = "Market Wire"
    published_at: Optional[str] = None
    sentiment_score: float = Field(ge=-1.0, le=1.0)

class SentimentSignal(BaseModel):
    ticker: str
    aggregate_score: float = Field(ge=-1.0, le=1.0)  # -1.0 (bearish) to +1.0 (bullish)
    sentiment_label: Literal["VERY_BEARISH", "BEARISH", "NEUTRAL", "BULLISH", "VERY_BULLISH"]
    confidence: float = Field(ge=0.0, le=1.0)
    headlines_analyzed: List[SentimentItem] = []
    reasoning: str

class ProposedTradeOrder(BaseModel):
    ticker: str
    action: Literal["BUY", "SELL", "HOLD"]
    current_price: float
    target_allocation_pct: float = Field(ge=0.0, le=1.0)
    target_shares: int = 0
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str

class RiskCheckResult(BaseModel):
    rule_name: str
    passed: bool
    details: str
    threshold: Any
    actual_value: Any

class RiskDecision(BaseModel):
    approved: bool
    action_taken: Literal["APPROVED", "SCALED_DOWN", "REJECTED", "NO_ACTION"]
    original_allocation_pct: float
    approved_allocation_pct: float
    approved_shares: int
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    confidence: float
    checks: List[RiskCheckResult] = []
    rejection_reasons: List[str] = []

class ExecutionResult(BaseModel):
    order_id: str
    status: Literal["FILLED", "REJECTED", "SKIPPED"]
    action: str
    shares: int
    price: float
    total_cost: float
    execution_type: Literal["MOCK_EXCHANGE", "ALPACA_PAPER"]
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentExecutionTrace(BaseModel):
    run_id: str
    ticker: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    technical_signal: TechnicalSignal
    sentiment_signal: SentimentSignal
    strategist_proposal: ProposedTradeOrder
    risk_decision: RiskDecision
    execution_result: Optional[ExecutionResult] = None

class PositionSchema(BaseModel):
    id: int
    ticker: str
    shares: int
    avg_entry_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    updated_at: datetime

class TradeLogSchema(BaseModel):
    id: int
    run_id: str
    ticker: str
    action: str
    shares: int
    fill_price: float
    notional_value: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    risk_status: str
    risk_reason: Optional[str] = None
    execution_status: str
    execution_type: str
    created_at: datetime

class PortfolioStatusResponse(BaseModel):
    total_equity: float
    cash_balance: float
    daily_start_equity: float
    daily_pnl: float
    daily_pnl_pct: float
    win_rate: float
    closed_trades_count: int
    winning_trades_count: int
    positions_count: int
    positions: List[PositionSchema] = []
    recent_trades: List[TradeLogSchema] = []

class RunCycleRequest(BaseModel):
    ticker: str = "NVDA"
    force_action: Optional[Literal["BUY", "SELL", "HOLD"]] = None
