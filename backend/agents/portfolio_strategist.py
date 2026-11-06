from typing import Dict, Any, Optional
from backend.agents.state import AgentState
from backend.models.schemas import (
    TechnicalSignal,
    SentimentSignal,
    ProposedTradeOrder
)

def portfolio_strategist_node(state: AgentState) -> Dict[str, Any]:
    ticker = state.get("ticker", "NVDA")
    current_price = state.get("current_price", 150.0)
    portfolio_equity = state.get("portfolio_equity", 100000.0)
    existing_shares = state.get("existing_position_shares", 0)
    force_action = state.get("force_action")

    tech: Optional[TechnicalSignal] = state.get("technical_signal")
    sent: Optional[SentimentSignal] = state.get("sentiment_signal")

    # Extract metrics
    tech_trend = tech.trend if tech else "NEUTRAL"
    tech_strength = tech.signal_strength if tech else 0.5
    sent_score = sent.aggregate_score if sent else 0.0
    sent_conf = sent.confidence if sent else 0.5

    # Composite directional score [-1.0, 1.0]
    tech_numeric = 1.0 if tech_trend == "BULLISH" else (-1.0 if tech_trend == "BEARISH" else 0.0)
    composite_score = (tech_numeric * 0.60 * tech_strength) + (sent_score * 0.40 * sent_conf)

    # Determine Proposed Action
    if force_action:
        action = force_action
        confidence = 0.85
        rationale = f"Manual override force action: {action}"
    else:
        if composite_score >= 0.20:
            action = "BUY"
            # High confidence if both agree
            confidence = round(min(0.95, 0.65 + (composite_score * 0.35)), 2)
            rationale = (
                f"Bullish alignment: Technical Trend={tech_trend} (Strength={int(tech_strength*100)}%), "
                f"Sentiment Score={sent_score:+.2f} (Composite={composite_score:+.2f})."
            )
        elif composite_score <= -0.25 and existing_shares > 0:
            action = "SELL"
            confidence = round(min(0.95, 0.65 + (abs(composite_score) * 0.35)), 2)
            rationale = (
                f"Bearish momentum: Technical Trend={tech_trend}, "
                f"Sentiment Score={sent_score:+.2f}. Proposing risk-off liquidation of existing position."
            )
        else:
            action = "HOLD"
            confidence = round(max(0.40, 1.0 - abs(composite_score) * 1.5), 2)
            rationale = (
                f"Neutral/Conflicting indicators (Composite score {composite_score:+.2f}). "
                f"Conditions do not meet tactical entry threshold."
            )

    # Calculate stop loss, take profit, and allocation
    target_allocation_pct = 0.0
    stop_loss = None
    take_profit = None
    target_shares = 0

    if action == "BUY":
        # Target ~4.5% equity (safely under the 5% max limit)
        target_allocation_pct = 0.045
        target_allocation_dollars = portfolio_equity * target_allocation_pct
        target_shares = max(1, int(target_allocation_dollars / current_price))
        
        # Stop-loss at 2.0% below entry (strictly compliant with <= 3% rule)
        stop_loss = round(current_price * 0.98, 2)
        # Take-profit at 5.0% above entry
        take_profit = round(current_price * 1.05, 2)

    elif action == "SELL":
        target_allocation_pct = 0.0
        target_shares = existing_shares
        stop_loss = None
        take_profit = None

    proposal = ProposedTradeOrder(
        ticker=ticker,
        action=action,
        current_price=current_price,
        target_allocation_pct=target_allocation_pct,
        target_shares=target_shares,
        stop_loss=stop_loss,
        take_profit=take_profit,
        confidence=confidence,
        rationale=rationale
    )

    return {
        "strategist_proposal": proposal
    }
