from fastapi import APIRouter, HTTPException, Query
from backend.services.market_data import MarketDataService
from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/watchlist")
def get_watchlist() -> List[Dict[str, Any]]:
    """
    Returns real-time streaming quotes for ticker tape.
    """
    return MarketDataService.get_watchlist_quotes(["NVDA", "AAPL", "MSFT", "BTC-USD", "TSLA", "SPY", "QQQ"])

@router.get("/quote/{ticker}")
def get_single_quote(ticker: str) -> Dict[str, Any]:
    """
    Returns instant real-time live quote for a ticker.
    """
    return MarketDataService.get_live_quote(ticker)

@router.get("/{ticker}")
def get_market_analysis(
    ticker: str,
    timeframe: str = Query("1M", description="Chart timeframe: 1D, 5D, 1M, 3M, 1Y")
) -> Dict[str, Any]:
    try:
        live_quote = MarketDataService.get_live_quote(ticker)
        df = MarketDataService.fetch_ohlcv(ticker, timeframe=timeframe)
        indicators = MarketDataService.calculate_technical_indicators(df)
        news = MarketDataService.fetch_recent_news(ticker)

        return {
            "ticker": ticker.upper(),
            "timeframe": timeframe.upper(),
            "quote": live_quote,
            "indicators": indicators,
            "news": news
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market data error: {str(e)}")
