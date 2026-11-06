from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.db_models import PortfolioSnapshot, Position, TradeLog
from backend.models.schemas import PortfolioStatusResponse, PositionSchema, TradeLogSchema
from backend.services.mock_exchange import MockExchange
from backend.config import settings

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("", response_model=PortfolioStatusResponse)
def get_portfolio(db: Session = Depends(get_db)):
    mock = MockExchange(db)
    portfolio = mock.get_latest_portfolio()

    # Recalculate positions and equity
    positions = db.query(Position).all()
    # Update current market value
    mock._recalculate_portfolio_equity(portfolio)
    db.commit()
    db.refresh(portfolio)

    pos_schemas = [
        PositionSchema(
            id=p.id,
            ticker=p.ticker,
            shares=p.shares,
            avg_entry_price=p.avg_entry_price,
            current_price=p.current_price,
            market_value=p.market_value,
            unrealized_pnl=p.unrealized_pnl,
            unrealized_pnl_pct=p.unrealized_pnl_pct,
            stop_loss=p.stop_loss,
            take_profit=p.take_profit,
            updated_at=p.updated_at
        )
        for p in positions
    ]

    recent_trades = db.query(TradeLog).order_by(TradeLog.id.desc()).limit(20).all()
    trade_schemas = [
        TradeLogSchema(
            id=t.id,
            run_id=t.run_id,
            ticker=t.ticker,
            action=t.action,
            shares=t.shares,
            fill_price=t.fill_price,
            notional_value=t.notional_value,
            stop_loss=t.stop_loss,
            take_profit=t.take_profit,
            risk_status=t.risk_status,
            risk_reason=t.risk_reason,
            execution_status=t.execution_status,
            execution_type=t.execution_type,
            created_at=t.created_at
        )
        for t in recent_trades
    ]

    return PortfolioStatusResponse(
        total_equity=portfolio.total_equity,
        cash_balance=portfolio.cash_balance,
        daily_start_equity=portfolio.daily_start_equity,
        daily_pnl=portfolio.daily_pnl,
        daily_pnl_pct=portfolio.daily_pnl_pct,
        win_rate=portfolio.win_rate,
        closed_trades_count=portfolio.closed_trades_count,
        winning_trades_count=portfolio.winning_trades_count,
        positions_count=len(positions),
        positions=pos_schemas,
        recent_trades=trade_schemas
    )

@router.post("/reset")
def reset_portfolio(db: Session = Depends(get_db)):
    db.query(Position).delete()
    db.query(TradeLog).delete()
    db.query(PortfolioSnapshot).delete()
    initial = PortfolioSnapshot(
        total_equity=settings.DEFAULT_INITIAL_CASH,
        cash_balance=settings.DEFAULT_INITIAL_CASH,
        daily_start_equity=settings.DEFAULT_INITIAL_CASH,
        daily_pnl=0.0,
        daily_pnl_pct=0.0,
        win_rate=0.0,
        closed_trades_count=0,
        winning_trades_count=0
    )
    db.add(initial)
    db.commit()
    return {"status": "SUCCESS", "message": f"Portfolio reset to ${settings.DEFAULT_INITIAL_CASH:,.2f}"}
