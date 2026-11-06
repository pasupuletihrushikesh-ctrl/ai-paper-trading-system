from typing import List, Dict, Any
from backend.agents.state import AgentState
from backend.services.market_data import MarketDataService
from backend.models.schemas import SentimentSignal, SentimentItem
from backend.config import settings
import re
import json

BULLISH_KEYWORDS = {
    "surge": 0.8, "rally": 0.7, "upgrade": 0.85, "profit": 0.6, "jump": 0.6,
    "growth": 0.6, "outperform": 0.8, "record": 0.7, "momentum": 0.65,
    "partnership": 0.6, "expansion": 0.5, "beats": 0.75, "bull": 0.6,
    "gain": 0.5, "advance": 0.5, "upside": 0.7, "resilient": 0.5,
    "demand": 0.5, "innovat": 0.5, "breakthrough": 0.8
}

BEARISH_KEYWORDS = {
    "drop": -0.6, "plunge": -0.85, "downgrade": -0.8, "loss": -0.7,
    "fall": -0.5, "miss": -0.75, "slump": -0.7, "probe": -0.65,
    "risk": -0.5, "lawsuit": -0.7, "cut": -0.6, "warning": -0.75,
    "bear": -0.6, "decline": -0.5, "retreat": -0.5, "slide": -0.6,
    "pressure": -0.5, "slowdown": -0.6, "weakness": -0.6, "delay": -0.5
}

def analyze_headline_heuristic(text: str) -> float:
    lower = text.lower()
    score = 0.0
    matched = 0
    for kw, val in BULLISH_KEYWORDS.items():
        if kw in lower:
            score += val
            matched += 1
    for kw, val in BEARISH_KEYWORDS.items():
        if kw in lower:
            score += val
            matched += 1
    if matched == 0:
        return 0.05  # slightly positive default bias for growing blue-chips
    return max(-1.0, min(1.0, score / matched))

def sentiment_analyst_node(state: AgentState) -> Dict[str, Any]:
    ticker = state.get("ticker", "NVDA")
    raw_news = MarketDataService.fetch_recent_news(ticker)

    sentiment_items: List[SentimentItem] = []
    total_score = 0.0

    for item in raw_news:
        headline = item.get("headline", "")
        publisher = item.get("publisher", "Market News")
        pub_at = item.get("published_at", "")

        score = analyze_headline_heuristic(headline)
        sentiment_items.append(
            SentimentItem(
                headline=headline,
                publisher=publisher,
                published_at=pub_at,
                sentiment_score=round(score, 2)
            )
        )
        total_score += score

    count = len(sentiment_items) if sentiment_items else 1
    aggregate_score = round(max(-1.0, min(1.0, total_score / count)), 2)

    # Classify sentiment label
    if aggregate_score >= 0.40:
        label = "VERY_BULLISH"
    elif aggregate_score >= 0.10:
        label = "BULLISH"
    elif aggregate_score <= -0.40:
        label = "VERY_BEARISH"
    elif aggregate_score <= -0.10:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    confidence = round(min(0.95, 0.65 + (len(sentiment_items) * 0.05)), 2)

    reasoning = (
        f"Analyzed {len(sentiment_items)} market news items for {ticker}. "
        f"Aggregate sentiment scored {aggregate_score:+.2f} ({label}). "
        f"Media coverage reflects {'positive product momentum and analyst support' if aggregate_score > 0 else 'elevated macro caution or headwind concerns'}."
    )

    sentiment_signal = SentimentSignal(
        ticker=ticker,
        aggregate_score=aggregate_score,
        sentiment_label=label,
        confidence=confidence,
        headlines_analyzed=sentiment_items,
        reasoning=reasoning
    )

    return {
        "sentiment_signal": sentiment_signal
    }
