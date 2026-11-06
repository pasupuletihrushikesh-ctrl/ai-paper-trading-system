from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, Optional
from backend.models.db_models import PortfolioSnapshot, Position, TradeLog
from backend.models.schemas import ExecutionResult, ProposedTradeOrder, RiskDecision
import uuid

class MockExchange:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_portfolio(self) -> PortfolioSnapshot:
        portfolio = self.db.query(PortfolioSnapshot).order_by(PortfolioSnapshot.id.desc()).first()
        if not portfolio:
            portfolio = PortfolioSnapshot(
                total_equity=100000.0,
                cash_balance=100000.0,
                daily_start_equity=100000.0,
                daily_pnl=0.0,
                daily_pnl_pct=0.0,
                win_rate=0.0,
                closed_trades_count=0,
                winning_trades_count=0
            )
            self.db.add(portfolio)
            self.db.commit()
            self.db.refresh(portfolio)
        return portfolio

    def execute_order(
        self,
        run_id: str,
        proposal: ProposedTradeOrder,
        risk: RiskDecision
    ) -> ExecutionResult:
        order_id = f"ord-{uuid.uuid4().hex[:8]}"

        if not risk.approved:
            # Record rejected trade in log for auditability
            trade_log = TradeLog(
                run_id=run_id,
                ticker=proposal.ticker,
                action=proposal.action,
                shares=0,
                fill_price=proposal.current_price,
                notional_value=0.0,
                stop_loss=proposal.stop_loss,
                take_profit=proposal.take_profit,
                risk_status=risk.action_taken,
                risk_reason="; ".join(risk.rejection_reasons),
                execution_status="REJECTED",
                execution_type="MOCK_EXCHANGE"
            )
            self.db.add(trade_log)
            self.db.commit()

            return ExecutionResult(
                order_id=order_id,
                status="REJECTED",
                action=proposal.action,
                shares=0,
                price=proposal.current_price,
                total_cost=0.0,
                execution_type="MOCK_EXCHANGE",
                message=f"Order rejected by Risk Engine: {'; '.join(risk.rejection_reasons)}"
            )

        if proposal.action == "HOLD" or risk.approved_shares <= 0:
            return ExecutionResult(
                order_id=order_id,
                status="SKIPPED",
                action="HOLD",
                shares=0,
                price=proposal.current_price,
                total_cost=0.0,
                execution_type="MOCK_EXCHANGE",
                message="No trading action required for HOLD signal"
            )

        portfolio = self.get_latest_portfolio()
        shares = risk.approved_shares
        fill_price = proposal.current_price
        notional = shares * fill_price

        if proposal.action == "BUY":
            if portfolio.cash_balance < notional:
                # Fallback safeguard
                return ExecutionResult(
                    order_id=order_id,
                    status="REJECTED",
                    action="BUY",
                    shares=shares,
                    price=fill_price,
                    total_cost=notional,
                    execution_type="MOCK_EXCHANGE",
                    message="Insufficient cash balance for execution"
                )

            # Deduct cash
            portfolio.cash_balance -= notional

            # Upsert position
            position = self.db.query(Position).filter(Position.ticker == proposal.ticker).first()
            if position:
                total_shares = position.shares + shares
                total_cost = (position.shares * position.avg_entry_price) + notional
                position.avg_entry_price = round(total_cost / total_shares, 2)
                position.shares = total_shares
                position.current_price = fill_price
                position.market_value = round(total_shares * fill_price, 2)
                position.unrealized_pnl = round(position.market_value - total_cost, 2)
                position.unrealized_pnl_pct = round((position.unrealized_pnl / total_cost) * 100, 2) if total_cost > 0 else 0.0
                position.stop_loss = risk.stop_loss
                position.take_profit = risk.take_profit
                position.updated_at = datetime.utcnow()
            else:
                position = Position(
                    ticker=proposal.ticker,
                    shares=shares,
                    avg_entry_price=fill_price,
                    current_price=fill_price,
                    market_value=notional,
                    unrealized_pnl=0.0,
                    unrealized_pnl_pct=0.0,
                    stop_loss=risk.stop_loss,
                    take_profit=risk.take_profit,
                    updated_at=datetime.utcnow()
                )
                self.db.add(position)

            # Update portfolio metrics
            self._recalculate_portfolio_equity(portfolio)

            # Trade log
            trade_log = TradeLog(
                run_id=run_id,
                ticker=proposal.ticker,
                action="BUY",
                shares=shares,
                fill_price=fill_price,
                notional_value=notional,
                stop_loss=risk.stop_loss,
                take_profit=risk.take_profit,
                risk_status=risk.action_taken,
                risk_reason="Passed all deterministic guardrails" if not risk.rejection_reasons else "; ".join(risk.rejection_reasons),
                execution_status="FILLED",
                execution_type="MOCK_EXCHANGE"
            )
            self.db.add(trade_log)
            self.db.commit()

            return ExecutionResult(
                order_id=order_id,
                status="FILLED",
                action="BUY",
                shares=shares,
                price=fill_price,
                total_cost=notional,
                execution_type="MOCK_EXCHANGE",
                message=f"Successfully filled BUY {shares} shares of {proposal.ticker} @ ${fill_price:.2f}"
            )

        elif proposal.action == "SELL":
            position = self.db.query(Position).filter(Position.ticker == proposal.ticker).first()
            if not position or position.shares <= 0:
                return ExecutionResult(
                    order_id=order_id,
                    status="REJECTED",
                    action="SELL",
                    shares=0,
                    price=fill_price,
                    total_cost=0.0,
                    execution_type="MOCK_EXCHANGE",
                    message=f"No open long position in {proposal.ticker} to sell"
                )

            sell_shares = min(shares, position.shares)
            proceeds = sell_shares * fill_price
            realized_pnl = (fill_price - position.avg_entry_price) * sell_shares

            portfolio.cash_balance += proceeds
            portfolio.closed_trades_count += 1
            if realized_pnl > 0:
                portfolio.winning_trades_count += 1
            portfolio.win_rate = round(
                (portfolio.winning_trades_count / portfolio.closed_trades_count) * 100, 1
            ) if portfolio.closed_trades_count > 0 else 0.0

            position.shares -= sell_shares
            if position.shares <= 0:
                self.db.delete(position)
            else:
                position.market_value = position.shares * fill_price
                position.current_price = fill_price
                cost_basis = position.shares * position.avg_entry_price
                position.unrealized_pnl = round(position.market_value - cost_basis, 2)
                position.unrealized_pnl_pct = round((position.unrealized_pnl / cost_basis) * 100, 2)
                position.updated_at = datetime.utcnow()

            self._recalculate_portfolio_equity(portfolio)

            trade_log = TradeLog(
                run_id=run_id,
                ticker=proposal.ticker,
                action="SELL",
                shares=sell_shares,
                fill_price=fill_price,
                notional_value=proceeds,
                stop_loss=None,
                take_profit=None,
                risk_status=risk.action_taken,
                risk_reason=f"Realized P&L: ${realized_pnl:+.2f}",
                execution_status="FILLED",
                execution_type="MOCK_EXCHANGE"
            )
            self.db.add(trade_log)
            self.db.commit()

            return ExecutionResult(
                order_id=order_id,
                status="FILLED",
                action="SELL",
                shares=sell_shares,
                price=fill_price,
                total_cost=proceeds,
                execution_type="MOCK_EXCHANGE",
                message=f"Successfully filled SELL {sell_shares} shares of {proposal.ticker} @ ${fill_price:.2f} (Realized P&L: ${realized_pnl:+.2f})"
            )

        return ExecutionResult(
            order_id=order_id,
            status="SKIPPED",
            action=proposal.action,
            shares=0,
            price=fill_price,
            total_cost=0.0,
            execution_type="MOCK_EXCHANGE",
            message=f"Unrecognized action: {proposal.action}"
        )

    def _recalculate_portfolio_equity(self, portfolio: PortfolioSnapshot):
        positions = self.db.query(Position).all()
        positions_market_value = sum(p.shares * p.current_price for p in positions)
        portfolio.total_equity = round(portfolio.cash_balance + positions_market_value, 2)
        portfolio.daily_pnl = round(portfolio.total_equity - portfolio.daily_start_equity, 2)
        portfolio.daily_pnl_pct = round((portfolio.daily_pnl / portfolio.daily_start_equity) * 100, 2) if portfolio.daily_start_equity > 0 else 0.0
