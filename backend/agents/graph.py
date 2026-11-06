from langgraph.graph import StateGraph, END
from backend.agents.state import AgentState
from backend.agents.technical_analyst import technical_analyst_node
from backend.agents.sentiment_analyst import sentiment_analyst_node
from backend.agents.portfolio_strategist import portfolio_strategist_node
from backend.agents.risk_manager import risk_manager_node
from backend.services.mock_exchange import MockExchange
from backend.services.alpaca_client import AlpacaPaperClient
from backend.models.db_models import AgentTraceLog, PortfolioSnapshot, Position
from backend.models.schemas import AgentExecutionTrace
from sqlalchemy.orm import Session
import uuid
import datetime

def execution_node(state: AgentState) -> dict:
    """
    Executes the approved trade order via MockExchange or Alpaca Paper Trading.
    Note: The database session and execution logic are handled by the runner.
    """
    return {}

def build_trading_graph():
    builder = StateGraph(AgentState)

    builder.add_node("technical_analyst", technical_analyst_node)
    builder.add_node("sentiment_analyst", sentiment_analyst_node)
    builder.add_node("portfolio_strategist", portfolio_strategist_node)
    builder.add_node("risk_manager", risk_manager_node)

    builder.set_entry_point("technical_analyst")
    builder.add_edge("technical_analyst", "sentiment_analyst")
    builder.add_edge("sentiment_analyst", "portfolio_strategist")
    builder.add_edge("portfolio_strategist", "risk_manager")
    builder.add_edge("risk_manager", END)

    return builder.compile()

trading_graph = build_trading_graph()

def run_trading_cycle(ticker: str, db: Session, force_action: str = None) -> AgentExecutionTrace:
    run_id = f"run-{uuid.uuid4().hex[:12]}"
    mock_exchange = MockExchange(db)
    portfolio = mock_exchange.get_latest_portfolio()

    # Calculate current daily drawdown pct
    daily_drawdown_pct = 0.0
    if portfolio.daily_start_equity > 0 and portfolio.total_equity < portfolio.daily_start_equity:
        daily_drawdown_pct = round((portfolio.daily_start_equity - portfolio.total_equity) / portfolio.daily_start_equity, 4)

    # Check existing position shares for this ticker
    position = db.query(Position).filter(Position.ticker == ticker.upper()).first()
    existing_shares = position.shares if position else 0

    initial_state: AgentState = {
        "run_id": run_id,
        "ticker": ticker.upper(),
        "force_action": force_action,
        "portfolio_equity": portfolio.total_equity,
        "cash_balance": portfolio.cash_balance,
        "daily_drawdown_pct": daily_drawdown_pct,
        "existing_position_shares": existing_shares,
        "errors": []
    }

    # Execute LangGraph stateful workflow
    final_state = trading_graph.invoke(initial_state)

    proposal = final_state.get("strategist_proposal")
    risk = final_state.get("risk_decision")

    # Execute trade via Mock Exchange (or Alpaca if configured)
    alpaca = AlpacaPaperClient()
    execution_result = None

    if risk and proposal:
        if alpaca.is_configured and risk.approved and proposal.action in ("BUY", "SELL"):
            # Attempt live Alpaca paper order
            import asyncio
            try:
                side = "buy" if proposal.action == "BUY" else "sell"
                alpaca_resp = asyncio.run(
                    alpaca.submit_order(
                        ticker=ticker,
                        qty=risk.approved_shares,
                        side=side,
                        stop_loss=risk.stop_loss,
                        take_profit=risk.take_profit
                    )
                )
                if alpaca_resp:
                    execution_result = mock_exchange.execute_order(run_id, proposal, risk)
                    execution_result.execution_type = "ALPACA_PAPER"
                    execution_result.message = f"Executed on Alpaca Paper: Order ID {alpaca_resp.get('id')}"
            except Exception as e:
                print(f"[run_trading_cycle] Alpaca submission fallback: {e}")

        if not execution_result:
            execution_result = mock_exchange.execute_order(run_id, proposal, risk)

    # Persist trace in database for dashboard feed and audit
    trace_record = AgentTraceLog(
        run_id=run_id,
        ticker=ticker.upper(),
        timestamp=datetime.datetime.utcnow(),
        technical_data=final_state["technical_signal"].model_dump(mode="json") if final_state.get("technical_signal") else {},
        sentiment_data=final_state["sentiment_signal"].model_dump(mode="json") if final_state.get("sentiment_signal") else {},
        strategist_data=final_state["strategist_proposal"].model_dump(mode="json") if final_state.get("strategist_proposal") else {},
        risk_data=final_state["risk_decision"].model_dump(mode="json") if final_state.get("risk_decision") else {},
        execution_data=execution_result.model_dump(mode="json") if execution_result else {}
    )
    db.add(trace_record)
    db.commit()

    return AgentExecutionTrace(
        run_id=run_id,
        ticker=ticker.upper(),
        timestamp=datetime.datetime.utcnow(),
        technical_signal=final_state["technical_signal"],
        sentiment_signal=final_state["sentiment_signal"],
        strategist_proposal=final_state["strategist_proposal"],
        risk_decision=final_state["risk_decision"],
        execution_result=execution_result
    )
