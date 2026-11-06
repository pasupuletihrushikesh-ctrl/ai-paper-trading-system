import pytest
from backend.agents.risk_manager import DeterministicRiskManager
from backend.models.schemas import ProposedTradeOrder

@pytest.fixture
def risk_manager():
    return DeterministicRiskManager(
        max_position_allocation_pct=0.05,
        max_stop_loss_pct=0.03,
        max_daily_drawdown_pct=0.02,
        min_confidence=0.70
    )

def test_approve_valid_buy_order(risk_manager):
    """
    Test that a valid order complying with all 4 guardrails is APPROVED:
    - Allocation <= 5% (here 4%)
    - Stop-loss <= 3% (here 2%)
    - Daily drawdown < 2% (here 0.5%)
    - Confidence >= 0.70 (here 0.85)
    """
    order = ProposedTradeOrder(
        ticker="NVDA",
        action="BUY",
        current_price=100.0,
        target_allocation_pct=0.04,
        target_shares=40,  # 40 * $100 = $4,000 (4% of $100,000)
        stop_loss=98.0,    # 2% stop-loss (<= 3%)
        take_profit=105.0,
        confidence=0.85,
        rationale="Strong technical momentum"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.005
    )

    assert decision.approved is True
    assert decision.action_taken == "APPROVED"
    assert decision.approved_shares == 40
    assert len(decision.rejection_reasons) == 0

def test_reject_missing_stop_loss(risk_manager):
    """
    Proves that a BUY order without a stop-loss is deterministically REJECTED.
    """
    order = ProposedTradeOrder(
        ticker="AAPL",
        action="BUY",
        current_price=200.0,
        target_allocation_pct=0.03,
        target_shares=15,
        stop_loss=None,   # Missing stop-loss!
        take_profit=210.0,
        confidence=0.80,
        rationale="Earnings beat expected"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("stop-loss is missing" in r.lower() for r in decision.rejection_reasons)

def test_reject_stop_loss_above_entry(risk_manager):
    """
    Proves that a BUY order with an inverted stop-loss (>= entry price) is REJECTED.
    """
    order = ProposedTradeOrder(
        ticker="MSFT",
        action="BUY",
        current_price=400.0,
        target_allocation_pct=0.03,
        target_shares=7,
        stop_loss=405.0,  # Invalid: above entry!
        take_profit=420.0,
        confidence=0.80,
        rationale="Breakout test"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("below entry" in r.lower() for r in decision.rejection_reasons)

def test_reject_excessive_stop_loss_distance(risk_manager):
    """
    Proves that a BUY order with stop-loss wider than 3% (e.g. 5%) is deterministically REJECTED.
    """
    order = ProposedTradeOrder(
        ticker="NVDA",
        action="BUY",
        current_price=100.0,
        target_allocation_pct=0.04,
        target_shares=40,
        stop_loss=95.0,   # 5% distance (> 3% max limit!)
        take_profit=110.0,
        confidence=0.85,
        rationale="High volatility setup"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("stop-loss too wide" in r.lower() for r in decision.rejection_reasons)

def test_scale_down_oversized_allocation(risk_manager):
    """
    Proves that an oversized order (> 5% of total portfolio equity, e.g. 10%)
    is deterministically scaled down to the 5.0% maximum cap.
    """
    order = ProposedTradeOrder(
        ticker="NVDA",
        action="BUY",
        current_price=100.0,
        target_allocation_pct=0.10,  # Requests 10% ($10,000)
        target_shares=100,
        stop_loss=98.0,
        take_profit=105.0,
        confidence=0.80,
        rationale="High conviction trade"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.005
    )

    assert decision.approved is True
    assert decision.action_taken == "SCALED_DOWN"
    # Max allowed is 5% of $100k = $5,000 / $100 = 50 shares
    assert decision.approved_shares == 50
    assert decision.approved_allocation_pct == 0.05

def test_reject_excessive_daily_drawdown(risk_manager):
    """
    Proves that when daily portfolio drawdown breaches 2% (e.g. 2.5%),
    new BUY orders are deterministically BLOCKED.
    """
    order = ProposedTradeOrder(
        ticker="NVDA",
        action="BUY",
        current_price=100.0,
        target_allocation_pct=0.03,
        target_shares=30,
        stop_loss=98.0,
        take_profit=105.0,
        confidence=0.90,
        rationale="Dip buying attempt"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=97500.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.025  # 2.5% drawdown >= 2.0% limit
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("daily drawdown" in r.lower() for r in decision.rejection_reasons)

def test_reject_low_confidence(risk_manager):
    """
    Proves that an order with confidence below 0.70 (e.g. 0.65) is deterministically REJECTED.
    """
    order = ProposedTradeOrder(
        ticker="TSLA",
        action="BUY",
        current_price=200.0,
        target_allocation_pct=0.03,
        target_shares=15,
        stop_loss=196.0,  # 2% stop loss
        take_profit=210.0,
        confidence=0.65,  # Below 0.70 threshold!
        rationale="Marginal signal strength"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("low confidence" in r.lower() for r in decision.rejection_reasons)

def test_insufficient_cash_blocks_or_scales(risk_manager):
    """
    Proves that when available cash is less than share cost, the trade is blocked or scaled.
    """
    order = ProposedTradeOrder(
        ticker="NVDA",
        action="BUY",
        current_price=100.0,
        target_allocation_pct=0.04,
        target_shares=40,
        stop_loss=98.0,
        take_profit=105.0,
        confidence=0.85,
        rationale="Setup valid but account depleted"
    )
    # Available cash is only $50, which is less than 1 share ($100)
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is False
    assert decision.action_taken == "REJECTED"
    assert any("insufficient cash" in r.lower() for r in decision.rejection_reasons)

def test_hold_action_passes_safely(risk_manager):
    """
    Proves that HOLD proposals pass smoothly without deploying capital.
    """
    order = ProposedTradeOrder(
        ticker="AAPL",
        action="HOLD",
        current_price=200.0,
        target_allocation_pct=0.0,
        target_shares=0,
        stop_loss=None,
        take_profit=None,
        confidence=0.50,
        rationale="Neutral regime"
    )
    decision = risk_manager.evaluate(
        order=order,
        portfolio_equity=100000.0,
        cash_balance=50000.0,
        daily_drawdown_pct=0.0
    )

    assert decision.approved is True
    assert decision.action_taken == "NO_ACTION"
    assert decision.approved_shares == 0
