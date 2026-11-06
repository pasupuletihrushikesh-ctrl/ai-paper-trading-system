from typing import Dict, Any
from backend.agents.state import AgentState
from backend.services.market_data import MarketDataService
from backend.models.schemas import TechnicalSignal, IndicatorData

def technical_analyst_node(state: AgentState) -> Dict[str, Any]:
    ticker = state.get("ticker", "NVDA")
    
    # 1. Fetch OHLCV and compute indicators
    df = MarketDataService.fetch_ohlcv(ticker, period="60d", interval="1d")
    indicators_dict = MarketDataService.calculate_technical_indicators(df)
    
    current_price = indicators_dict["current_price"]
    rsi = indicators_dict["rsi_14"]
    macd_line = indicators_dict["macd_line"]
    macd_sig = indicators_dict["macd_signal"]
    macd_hist = indicators_dict["macd_hist"]
    bb_upper = indicators_dict["bb_upper"]
    bb_middle = indicators_dict["bb_middle"]
    bb_lower = indicators_dict["bb_lower"]
    ema_50 = indicators_dict["ema_50"]
    ema_200 = indicators_dict["ema_200"]

    # 2. Multi-factor technical evaluation
    bullish_points = 0
    bearish_points = 0
    total_factors = 5

    # Factor A: RSI
    if 40 <= rsi <= 65:
        bullish_points += 1  # Healthy momentum without overbought
    elif rsi > 70:
        bearish_points += 1  # Overbought pullback risk
    elif rsi < 30:
        bullish_points += 0.5 # Oversold bounce potential
    else:
        bullish_points += 0.5

    # Factor B: MACD Histogram & Cross
    if macd_hist > 0 and macd_line > macd_sig:
        bullish_points += 1
    elif macd_hist < 0 and macd_line < macd_sig:
        bearish_points += 1
    else:
        bullish_points += 0.5
        bearish_points += 0.5

    # Factor C: Price vs EMA 50
    if current_price > ema_50:
        bullish_points += 1
    else:
        bearish_points += 1

    # Factor D: Golden / Death Cross alignment (EMA 50 vs EMA 200)
    if ema_50 >= ema_200:
        bullish_points += 1
    else:
        bearish_points += 1

    # Factor E: Bollinger Bands Position
    if current_price <= bb_lower * 1.01:
        bullish_points += 0.5  # Mean reversion upward
    elif current_price >= bb_upper * 0.99:
        bearish_points += 0.5  # Rejection downward
    else:
        bullish_points += 0.5

    if bullish_points > bearish_points + 0.8:
        trend = "BULLISH"
        signal_strength = round(min(1.0, bullish_points / total_factors), 2)
    elif bearish_points > bullish_points + 0.8:
        trend = "BEARISH"
        signal_strength = round(min(1.0, bearish_points / total_factors), 2)
    else:
        trend = "NEUTRAL"
        signal_strength = 0.50

    summary = (
        f"Price ${current_price:.2f} | RSI: {rsi:.1f} | MACD Hist: {macd_hist:+.2f} | "
        f"EMA50: ${ema_50:.2f} vs EMA200: ${ema_200:.2f} (Trend: {trend}, Strength: {int(signal_strength * 100)}%)"
    )

    indicators_obj = IndicatorData(
        rsi_14=rsi,
        macd_line=macd_line,
        macd_signal=macd_sig,
        macd_hist=macd_hist,
        bb_upper=bb_upper,
        bb_middle=bb_middle,
        bb_lower=bb_lower,
        ema_50=ema_50,
        ema_200=ema_200
    )

    technical_signal = TechnicalSignal(
        ticker=ticker,
        current_price=current_price,
        indicators=indicators_obj,
        trend=trend,
        signal_strength=signal_strength,
        summary=summary
    )

    return {
        "current_price": current_price,
        "raw_ohlcv": indicators_dict.get("raw_history", []),
        "technical_signal": technical_signal
    }
