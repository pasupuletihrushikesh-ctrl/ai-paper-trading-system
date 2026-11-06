from typing import TypedDict, Optional, List, Dict, Any
from backend.models.schemas import (
    TechnicalSignal,
    SentimentSignal,
    ProposedTradeOrder,
    RiskDecision,
    ExecutionResult
)

class AgentState(TypedDict, total=False):
    run_id: str
    ticker: str
    force_action: Optional[str]
    current_price: float
    portfolio_equity: float
    cash_balance: float
    daily_drawdown_pct: float
    existing_position_shares: int
    raw_ohlcv: List[Dict[str, Any]]
    technical_signal: Optional[TechnicalSignal]
    sentiment_signal: Optional[SentimentSignal]
    strategist_proposal: Optional[ProposedTradeOrder]
    risk_decision: Optional[RiskDecision]
    execution_result: Optional[ExecutionResult]
    errors: List[str]
