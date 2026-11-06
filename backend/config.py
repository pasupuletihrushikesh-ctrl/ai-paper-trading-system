import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ALPACA_API_KEY: str = os.getenv("ALPACA_API_KEY", "")
    ALPACA_SECRET_KEY: str = os.getenv("ALPACA_SECRET_KEY", "")
    ALPACA_BASE_URL: str = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets/v2")

    DEFAULT_INITIAL_CASH: float = float(os.getenv("DEFAULT_INITIAL_CASH", "100000.00"))
    MAX_POSITION_ALLOCATION_PCT: float = float(os.getenv("MAX_POSITION_ALLOCATION_PCT", "0.05"))
    MAX_STOP_LOSS_PCT: float = float(os.getenv("MAX_STOP_LOSS_PCT", "0.03"))
    MAX_DAILY_DRAWDOWN_PCT: float = float(os.getenv("MAX_DAILY_DRAWDOWN_PCT", "0.02"))
    MIN_STRATEGY_CONFIDENCE: float = float(os.getenv("MIN_STRATEGY_CONFIDENCE", "0.70"))

    DB_FILE: str = os.getenv("DB_FILE", str(BASE_DIR / "trading_state.db"))
    PORT: int = int(os.getenv("PORT", "8000"))

    @property
    def has_alpaca_credentials(self) -> bool:
        return bool(self.ALPACA_API_KEY and self.ALPACA_SECRET_KEY)

    @property
    def has_gemini_credentials(self) -> bool:
        return bool(self.GEMINI_API_KEY)

settings = Settings()
