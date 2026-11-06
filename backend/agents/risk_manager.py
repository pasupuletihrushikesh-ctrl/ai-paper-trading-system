from typing import Dict, Any, List, Optional
from backend.agents.state import AgentState
from backend.models.schemas import (
    ProposedTradeOrder,
    RiskDecision,
    RiskCheckResult
)
from backend.config import settings

class DeterministicRiskManager:
    """
    Pure Python deterministic risk guardrail with ZERO LLM calls.
    Enforces strict risk management rules:
      1. Position size cannot exceed 5% of total equity (scales down if oversized).
      2. Stop-loss is mandatory for BUY orders and cannot be wider than 3% from entry.
      3. Daily portfolio drawdown must not exceed 2%.
      4. Strategy confidence must be >= 0.70.
      5. Liquid cash balance must be sufficient.
    """

    def __init__(
        self,
        max_position_allocation_pct: float = 0.05,
        max_stop_loss_pct: float = 0.03,
        max_daily_drawdown_pct: float = 0.02,
        min_confidence: float = 0.70
    ):
        self.max_position_allocation = max_position_allocation_pct
        self.max_stop_loss_pct = max_stop_loss_pct
        self.max_daily_drawdown = max_daily_drawdown_pct
        self.min_confidence = min_confidence

    def evaluate(
        self,
        order: ProposedTradeOrder,
        portfolio_equity: float,
        cash_balance: float,
        daily_drawdown_pct: float,
        existing_position_shares: int = 0
    ) -> RiskDecision:
        checks: List[RiskCheckResult] = []
        rejection_reasons: List[str] = []
        is_scaled_down = False

        if order.action == "HOLD":
            return RiskDecision(
                approved=True,
                action_taken="NO_ACTION",
                original_allocation_pct=0.0,
                approved_allocation_pct=0.0,
                approved_shares=0,
                entry_price=order.current_price,
                stop_loss=None,
                take_profit=None,
                confidence=order.confidence,
                checks=[
                    RiskCheckResult(
                        rule_name="HOLD_ACTION",
                        passed=True,
                        details="No capital deployment requested for HOLD action.",
                        threshold="HOLD",
                        actual_value="HOLD"
                    )
                ],
                rejection_reasons=[]
            )

        # -------------------------------------------------------------
        # Rule 1: Strategy Confidence Guardrail (min 0.70)
        # -------------------------------------------------------------
        conf_passed = order.confidence >= self.min_confidence
        checks.append(
            RiskCheckResult(
                rule_name="MIN_CONFIDENCE",
                passed=conf_passed,
                details=f"Strategy confidence {order.confidence:.2f} vs minimum threshold {self.min_confidence:.2f}",
                threshold=self.min_confidence,
                actual_value=order.confidence
            )
        )
        if not conf_passed:
            rejection_reasons.append(
                f"Low confidence ({order.confidence:.2f} < {self.min_confidence:.2f})"
            )

        # -------------------------------------------------------------
        # Rule 2: Daily Portfolio Drawdown Guardrail (max 2.0%)
        # -------------------------------------------------------------
        # Note: daily_drawdown_pct is expressed as positive float, e.g. 0.02 = 2% drawdown
        dd_passed = daily_drawdown_pct < self.max_daily_drawdown
        checks.append(
            RiskCheckResult(
                rule_name="MAX_DAILY_DRAWDOWN",
                passed=dd_passed,
                details=f"Current daily drawdown {daily_drawdown_pct * 100:.2f}% vs max limit {self.max_daily_drawdown * 100:.2f}%",
                threshold=self.max_daily_drawdown,
                actual_value=daily_drawdown_pct
            )
        )
        if not dd_passed:
            rejection_reasons.append(
                f"Daily drawdown limit breached ({daily_drawdown_pct * 100:.2f}% >= {self.max_daily_drawdown * 100:.2f}%)"
            )

        # -------------------------------------------------------------
        # Rule 3: Stop-Loss Guardrail (Mandatory for BUY, <= 3.0% from entry)
        # -------------------------------------------------------------
        if order.action == "BUY":
            if order.stop_loss is None or order.stop_loss <= 0:
                checks.append(
                    RiskCheckResult(
                        rule_name="MANDATORY_STOP_LOSS",
                        passed=False,
                        details="Stop-loss price is missing or invalid for BUY order.",
                        threshold="Required",
                        actual_value="None"
                    )
                )
                rejection_reasons.append("Mandatory stop-loss is missing on BUY order")
            elif order.stop_loss >= order.current_price:
                checks.append(
                    RiskCheckResult(
                        rule_name="MANDATORY_STOP_LOSS",
                        passed=False,
                        details=f"Stop-loss (${order.stop_loss:.2f}) must be strictly below entry price (${order.current_price:.2f}).",
                        threshold=f"< {order.current_price:.2f}",
                        actual_value=order.stop_loss
                    )
                )
                rejection_reasons.append("Stop-loss price must be below entry price")
            else:
                sl_distance_pct = (order.current_price - order.stop_loss) / order.current_price
                sl_passed = sl_distance_pct <= (self.max_stop_loss_pct + 1e-6)
                checks.append(
                    RiskCheckResult(
                        rule_name="MAX_STOP_LOSS_DISTANCE",
                        passed=sl_passed,
                        details=f"Stop-loss distance {sl_distance_pct * 100:.2f}% vs maximum allowable {self.max_stop_loss_pct * 100:.2f}%",
                        threshold=self.max_stop_loss_pct,
                        actual_value=round(sl_distance_pct, 4)
                    )
                )
                if not sl_passed:
                    rejection_reasons.append(
                        f"Stop-loss too wide ({sl_distance_pct * 100:.2f}% > {self.max_stop_loss_pct * 100:.2f}%)"
                    )

        # -------------------------------------------------------------
        # Rule 4: Position Size & Allocation Guardrail (max 5.0% total equity)
        # -------------------------------------------------------------
        approved_allocation_pct = order.target_allocation_pct
        approved_shares = order.target_shares

        if order.action == "BUY":
            max_allowed_dollars = portfolio_equity * self.max_position_allocation
            requested_dollars = (
                order.target_shares * order.current_price 
                if order.target_shares > 0 
                else order.target_allocation_pct * portfolio_equity
            )
            requested_allocation_pct = (
                requested_dollars / portfolio_equity if portfolio_equity > 0 else 1.0
            )

            if requested_allocation_pct > self.max_position_allocation + 1e-6:
                # Deterministic scale-down to exactly 5% max cap
                is_scaled_down = True
                approved_allocation_pct = self.max_position_allocation
                approved_shares = int(max_allowed_dollars / order.current_price)
                checks.append(
                    RiskCheckResult(
                        rule_name="MAX_POSITION_SIZE",
                        passed=True,
                        details=f"Requested allocation {requested_allocation_pct * 100:.2f}% exceeded {self.max_position_allocation * 100:.2f}% limit. Scaled down to {approved_shares} shares.",
                        threshold=self.max_position_allocation,
                        actual_value=round(requested_allocation_pct, 4)
                    )
                )
            else:
                if approved_shares == 0 and approved_allocation_pct > 0:
                    approved_shares = int((approved_allocation_pct * portfolio_equity) / order.current_price)
                checks.append(
                    RiskCheckResult(
                        rule_name="MAX_POSITION_SIZE",
                        passed=True,
                        details=f"Position size {requested_allocation_pct * 100:.2f}% is within {self.max_position_allocation * 100:.2f}% limit.",
                        threshold=self.max_position_allocation,
                        actual_value=round(requested_allocation_pct, 4)
                    )
                )

            # Cash balance check
            required_cash = approved_shares * order.current_price
            if required_cash > cash_balance:
                possible_shares = int(cash_balance / order.current_price)
                if possible_shares > 0:
                    approved_shares = possible_shares
                    approved_allocation_pct = round((approved_shares * order.current_price) / portfolio_equity, 4)
                    is_scaled_down = True
                    checks.append(
                        RiskCheckResult(
                            rule_name="LIQUID_CASH_SUFFICIENCY",
                            passed=True,
                            details=f"Scaled down to {approved_shares} shares to fit available cash ${cash_balance:.2f}.",
                            threshold=cash_balance,
                            actual_value=required_cash
                        )
                    )
                else:
                    checks.append(
                        RiskCheckResult(
                            rule_name="LIQUID_CASH_SUFFICIENCY",
                            passed=False,
                            details=f"Insufficient cash balance (${cash_balance:.2f} < ${order.current_price:.2f}).",
                            threshold=cash_balance,
                            actual_value=required_cash
                        )
                    )
                    rejection_reasons.append(f"Insufficient cash (${cash_balance:.2f})")

            if approved_shares <= 0:
                rejection_reasons.append("Approved shares calculation resolved to zero")

        elif order.action == "SELL":
            # For SELL, cannot sell more shares than currently owned
            if existing_position_shares <= 0:
                checks.append(
                    RiskCheckResult(
                        rule_name="SELL_INVENTORY_CHECK",
                        passed=False,
                        details="Cannot sell shares without an existing long position.",
                        threshold="> 0 shares",
                        actual_value="0 shares"
                    )
                )
                rejection_reasons.append(f"No active position in {order.ticker} to sell")
            else:
                approved_shares = min(order.target_shares, existing_position_shares) if order.target_shares > 0 else existing_position_shares
                approved_allocation_pct = 0.0
                checks.append(
                    RiskCheckResult(
                        rule_name="SELL_INVENTORY_CHECK",
                        passed=True,
                        details=f"Approved liquidating {approved_shares} shares of {existing_position_shares} held.",
                        threshold=existing_position_shares,
                        actual_value=approved_shares
                    )
                )

        # -------------------------------------------------------------
        # Final Determination
        # -------------------------------------------------------------
        if rejection_reasons:
            return RiskDecision(
                approved=False,
                action_taken="REJECTED",
                original_allocation_pct=order.target_allocation_pct,
                approved_allocation_pct=0.0,
                approved_shares=0,
                entry_price=order.current_price,
                stop_loss=order.stop_loss,
                take_profit=order.take_profit,
                confidence=order.confidence,
                checks=checks,
                rejection_reasons=rejection_reasons
            )

        final_action = "SCALED_DOWN" if is_scaled_down else "APPROVED"

        return RiskDecision(
            approved=True,
            action_taken=final_action,
            original_allocation_pct=order.target_allocation_pct,
            approved_allocation_pct=approved_allocation_pct,
            approved_shares=approved_shares,
            entry_price=order.current_price,
            stop_loss=order.stop_loss,
            take_profit=order.take_profit,
            confidence=order.confidence,
            checks=checks,
            rejection_reasons=[]
        )

def risk_manager_node(state: AgentState) -> Dict[str, Any]:
    proposal: Optional[ProposedTradeOrder] = state.get("strategist_proposal")
    if not proposal:
        raise ValueError("Cannot run risk_manager_node without strategist_proposal in state")

    portfolio_equity = state.get("portfolio_equity", 100000.0)
    cash_balance = state.get("cash_balance", 100000.0)
    daily_drawdown_pct = state.get("daily_drawdown_pct", 0.0)
    existing_shares = state.get("existing_position_shares", 0)

    rm = DeterministicRiskManager(
        max_position_allocation_pct=settings.MAX_POSITION_ALLOCATION_PCT,
        max_stop_loss_pct=settings.MAX_STOP_LOSS_PCT,
        max_daily_drawdown_pct=settings.MAX_DAILY_DRAWDOWN_PCT,
        min_confidence=settings.MIN_STRATEGY_CONFIDENCE
    )

    decision = rm.evaluate(
        order=proposal,
        portfolio_equity=portfolio_equity,
        cash_balance=cash_balance,
        daily_drawdown_pct=daily_drawdown_pct,
        existing_position_shares=existing_shares
    )

    return {
        "risk_decision": decision
    }
