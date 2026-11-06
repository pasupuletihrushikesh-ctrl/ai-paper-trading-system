from sqlalchemy import Column, Integer, Float, String, DateTime, Text, Boolean, JSON
from datetime import datetime
from backend.database import Base

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    total_equity = Column(Float, nullable=False, default=100000.0)
    cash_balance = Column(Float, nullable=False, default=100000.0)
    daily_start_equity = Column(Float, nullable=False, default=100000.0)
    daily_pnl = Column(Float, default=0.0)
    daily_pnl_pct = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    closed_trades_count = Column(Integer, default=0)
    winning_trades_count = Column(Integer, default=0)

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(20), unique=True, index=True, nullable=False)
    shares = Column(Integer, nullable=False, default=0)
    avg_entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    market_value = Column(Float, nullable=False)
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TradeLog(Base):
    __tablename__ = "trade_logs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(64), index=True, nullable=False)
    ticker = Column(String(20), index=True, nullable=False)
    action = Column(String(10), nullable=False)  # BUY, SELL, HOLD
    shares = Column(Integer, nullable=False, default=0)
    fill_price = Column(Float, nullable=False)
    notional_value = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    risk_status = Column(String(20), nullable=False)  # APPROVED, SCALED_DOWN, REJECTED
    risk_reason = Column(Text, nullable=True)
    execution_status = Column(String(20), nullable=False)  # FILLED, REJECTED, SKIPPED
    execution_type = Column(String(20), default="MOCK_EXCHANGE")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AgentTraceLog(Base):
    __tablename__ = "agent_trace_logs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(64), unique=True, index=True, nullable=False)
    ticker = Column(String(20), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    technical_data = Column(JSON, nullable=False)
    sentiment_data = Column(JSON, nullable=False)
    strategist_data = Column(JSON, nullable=False)
    risk_data = Column(JSON, nullable=False)
    execution_data = Column(JSON, nullable=True)
