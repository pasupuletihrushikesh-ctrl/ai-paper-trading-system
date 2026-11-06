from fastapi import APIRouter, HTTPException
from backend.services.market_data import MarketDataService
from typing import Dict, Any

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/{ticker}")
def get_market_analysis(ticker: str) -> Dict[str, Any]:
    try:
        df = MarketDataService.fetch_ohlcv(ticker, period="60d", interval="1d")
        indicators = MarketDataService.calculate_technical_indicators(df)
        news = MarketDataService.fetch_recent_news(ticker)

        return {
            "ticker": ticker.upper(),
            "indicators": indicators,
            "news": news
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market data error: {str(e)}")
