from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models.schemas import RunCycleRequest, AgentExecutionTrace, TradeLogSchema
from backend.models.db_models import AgentTraceLog, TradeLog
from backend.agents.graph import run_trading_cycle

router = APIRouter(prefix="/api/trading", tags=["Trading"])

@router.post("/run-cycle", response_model=AgentExecutionTrace)
def trigger_agent_cycle(request: RunCycleRequest, db: Session = Depends(get_db)):
    try:
        trace = run_trading_cycle(
            ticker=request.ticker,
            db=db,
            force_action=request.force_action
        )
        return trace
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/traces", response_model=List[Dict[str, Any]])
def get_recent_traces(db: Session = Depends(get_db), limit: int = 10):
    traces = db.query(AgentTraceLog).order_by(AgentTraceLog.id.desc()).limit(limit).all()
    return [
        {
            "run_id": t.run_id,
            "ticker": t.ticker,
            "timestamp": t.timestamp.isoformat(),
            "technical_signal": t.technical_data,
            "sentiment_signal": t.sentiment_data,
            "strategist_proposal": t.strategist_data,
            "risk_decision": t.risk_data,
            "execution_result": t.execution_data
        }
        for t in traces
    ]

@router.get("/trades", response_model=List[TradeLogSchema])
def get_trade_logs(db: Session = Depends(get_db), limit: int = 50):
    trades = db.query(TradeLog).order_by(TradeLog.id.desc()).limit(limit).all()
    return [
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
        for t in trades
    ]
