import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

def reload_env():
    load_dotenv(ENV_PATH, override=True)

reload_env()

class Settings:
    @property
    def GEMINI_API_KEY(self) -> str:
        return os.getenv("GEMINI_API_KEY", "")

    @property
    def ALPACA_API_KEY(self) -> str:
        return os.getenv("ALPACA_API_KEY", "")

    @property
    def ALPACA_SECRET_KEY(self) -> str:
        return os.getenv("ALPACA_SECRET_KEY", "")

    @property
    def ALPACA_BASE_URL(self) -> str:
        return os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets/v2")

    @property
    def DEFAULT_INITIAL_CASH(self) -> float:
        return float(os.getenv("DEFAULT_INITIAL_CASH", "100000.00"))

    @property
    def MAX_POSITION_ALLOCATION_PCT(self) -> float:
        return float(os.getenv("MAX_POSITION_ALLOCATION_PCT", "0.05"))

    @property
    def MAX_STOP_LOSS_PCT(self) -> float:
        return float(os.getenv("MAX_STOP_LOSS_PCT", "0.03"))

    @property
    def MAX_DAILY_DRAWDOWN_PCT(self) -> float:
        return float(os.getenv("MAX_DAILY_DRAWDOWN_PCT", "0.02"))

    @property
    def MIN_STRATEGY_CONFIDENCE(self) -> float:
        return float(os.getenv("MIN_STRATEGY_CONFIDENCE", "0.70"))

    @property
    def DB_FILE(self) -> str:
        return os.getenv("DB_FILE", str(BASE_DIR / "trading_state.db"))

    @property
    def PORT(self) -> int:
        return int(os.getenv("PORT", "8000"))

    @property
    def has_alpaca_credentials(self) -> bool:
        return bool(self.ALPACA_API_KEY and self.ALPACA_SECRET_KEY)

    @property
    def has_gemini_credentials(self) -> bool:
        return bool(self.GEMINI_API_KEY)

    def update_credentials(self, alpaca_key: str = None, alpaca_secret: str = None, gemini_key: str = None):
        """
        Updates the .env file safely and reloads configuration.
        """
        env_dict = {}
        if ENV_PATH.exists():
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_dict[k.strip()] = v.strip()

        if alpaca_key is not None:
            env_dict["ALPACA_API_KEY"] = alpaca_key
            os.environ["ALPACA_API_KEY"] = alpaca_key
        if alpaca_secret is not None:
            env_dict["ALPACA_SECRET_KEY"] = alpaca_secret
            os.environ["ALPACA_SECRET_KEY"] = alpaca_secret
        if gemini_key is not None:
            env_dict["GEMINI_API_KEY"] = gemini_key
            os.environ["GEMINI_API_KEY"] = gemini_key

        # Set defaults if missing
        if "ALPACA_BASE_URL" not in env_dict:
            env_dict["ALPACA_BASE_URL"] = "https://paper-api.alpaca.markets/v2"
        if "DEFAULT_INITIAL_CASH" not in env_dict:
            env_dict["DEFAULT_INITIAL_CASH"] = "100000.00"
        if "MAX_POSITION_ALLOCATION_PCT" not in env_dict:
            env_dict["MAX_POSITION_ALLOCATION_PCT"] = "0.05"
        if "MAX_STOP_LOSS_PCT" not in env_dict:
            env_dict["MAX_STOP_LOSS_PCT"] = "0.03"
        if "MAX_DAILY_DRAWDOWN_PCT" not in env_dict:
            env_dict["MAX_DAILY_DRAWDOWN_PCT"] = "0.02"
        if "MIN_STRATEGY_CONFIDENCE" not in env_dict:
            env_dict["MIN_STRATEGY_CONFIDENCE"] = "0.70"
        if "DB_FILE" not in env_dict:
            env_dict["DB_FILE"] = "trading_state.db"
        if "PORT" not in env_dict:
            env_dict["PORT"] = "8000"

        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.write("# Google Gemini API Key for sentiment analysis and reasoning synthesis (Optional)\n")
            f.write(f"GEMINI_API_KEY={env_dict.get('GEMINI_API_KEY', '')}\n\n")
            f.write("# Alpaca Paper Trading API Credentials (Optional - Local SQLite Mock Exchange used if blank)\n")
            f.write(f"ALPACA_API_KEY={env_dict.get('ALPACA_API_KEY', '')}\n")
            f.write(f"ALPACA_SECRET_KEY={env_dict.get('ALPACA_SECRET_KEY', '')}\n")
            f.write(f"ALPACA_BASE_URL={env_dict.get('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets/v2')}\n\n")
            f.write("# System Configuration\n")
            f.write(f"DEFAULT_INITIAL_CASH={env_dict.get('DEFAULT_INITIAL_CASH', '100000.00')}\n")
            f.write(f"MAX_POSITION_ALLOCATION_PCT={env_dict.get('MAX_POSITION_ALLOCATION_PCT', '0.05')}\n")
            f.write(f"MAX_STOP_LOSS_PCT={env_dict.get('MAX_STOP_LOSS_PCT', '0.03')}\n")
            f.write(f"MAX_DAILY_DRAWDOWN_PCT={env_dict.get('MAX_DAILY_DRAWDOWN_PCT', '0.02')}\n")
            f.write(f"MIN_STRATEGY_CONFIDENCE={env_dict.get('MIN_STRATEGY_CONFIDENCE', '0.70')}\n")
            f.write(f"DB_FILE={env_dict.get('DB_FILE', 'trading_state.db')}\n")
            f.write(f"PORT={env_dict.get('PORT', '8000')}\n")

        reload_env()

settings = Settings()
