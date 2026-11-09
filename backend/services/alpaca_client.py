import httpx
from typing import Dict, Any, Optional, List
from backend.config import settings

class AlpacaPaperClient:
    def __init__(self, api_key: str = None, secret_key: str = None, base_url: str = None):
        self._api_key = api_key
        self._secret_key = secret_key
        self._base_url = base_url

    @property
    def api_key(self) -> str:
        return self._api_key or settings.ALPACA_API_KEY

    @property
    def secret_key(self) -> str:
        return self._secret_key or settings.ALPACA_SECRET_KEY

    @property
    def base_url(self) -> str:
        return (self._base_url or settings.ALPACA_BASE_URL).rstrip("/")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.secret_key and len(self.api_key) > 5)

    def _headers(self) -> Dict[str, str]:
        return {
            "APCA-API-KEY-ID": self.api_key.strip(),
            "APCA-API-SECRET-KEY": self.secret_key.strip(),
            "Content-Type": "application/json"
        }

    def get_account_sync(self) -> Optional[Dict[str, Any]]:
        """
        Synchronously fetches the Alpaca paper account status.
        """
        if not self.is_configured:
            return None
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.get(f"{self.base_url}/account", headers=self._headers())
                if res.status_code == 200:
                    return res.json()
                else:
                    print(f"[AlpacaPaperClient] Account check failed with HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[AlpacaPaperClient] Connection error: {e}")
        return None

    def test_connection(self) -> Dict[str, Any]:
        """
        Tests API key validity and returns formatted account metadata.
        """
        if not self.is_configured:
            return {
                "connected": False,
                "message": "Alpaca API credentials are not set. Using local SQLite Mock Exchange."
            }
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.get(f"{self.base_url}/account", headers=self._headers())
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "connected": True,
                        "status": data.get("status", "ACTIVE"),
                        "account_number": data.get("account_number", "")[-4:] if data.get("account_number") else "****",
                        "currency": data.get("currency", "USD"),
                        "cash": round(float(data.get("cash", 0)), 2),
                        "portfolio_value": round(float(data.get("portfolio_value", 0)), 2),
                        "buying_power": round(float(data.get("buying_power", 0)), 2),
                        "multiplier": data.get("multiplier", "1"),
                        "message": f"Connected to Alpaca Paper Trading (Status: {data.get('status', 'ACTIVE')})"
                    }
                elif res.status_code in (401, 403):
                    return {
                        "connected": False,
                        "message": f"Authentication failed (HTTP {res.status_code}): Invalid API Key or Secret"
                    }
                else:
                    return {
                        "connected": False,
                        "message": f"Alpaca API returned HTTP {res.status_code}: {res.text}"
                    }
        except Exception as e:
            return {
                "connected": False,
                "message": f"Network error contacting Alpaca: {str(e)}"
            }

    def submit_order_sync(
        self,
        ticker: str,
        qty: int,
        side: str,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Synchronously submits an order to Alpaca Paper Trading.
        Supports market bracket orders with stop-loss and take-profit legs.
        """
        if not self.is_configured or qty <= 0:
            return None

        payload: Dict[str, Any] = {
            "symbol": ticker.upper(),
            "qty": qty,
            "side": side.lower(),
            "type": "market",
            "time_in_force": "day"
        }

        # Alpaca bracket order rules
        if stop_loss and take_profit and side.lower() == "buy":
            payload["order_class"] = "bracket"
            payload["take_profit"] = {"limit_price": round(take_profit, 2)}
            payload["stop_loss"] = {"stop_price": round(stop_loss, 2)}
        elif stop_loss and side.lower() == "buy":
            payload["order_class"] = "oto"
            payload["stop_loss"] = {"stop_price": round(stop_loss, 2)}

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(f"{self.base_url}/orders", json=payload, headers=self._headers())
                if res.status_code in (200, 201):
                    return res.json()
                else:
                    print(f"[AlpacaPaperClient] Order rejected ({res.status_code}): {res.text}")
                    # If bracket order failed (e.g. market closed or symbol limitation), attempt basic market order
                    if payload.get("order_class"):
                        fallback_payload = {
                            "symbol": ticker.upper(),
                            "qty": qty,
                            "side": side.lower(),
                            "type": "market",
                            "time_in_force": "day"
                        }
                        res_fallback = client.post(f"{self.base_url}/orders", json=fallback_payload, headers=self._headers())
                        if res_fallback.status_code in (200, 201):
                            return res_fallback.json()
        except Exception as e:
            print(f"[AlpacaPaperClient] Order exception: {e}")
        return None

    def get_positions_sync(self) -> List[Dict[str, Any]]:
        """
        Fetches active positions from Alpaca account.
        """
        if not self.is_configured:
            return []
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.get(f"{self.base_url}/positions", headers=self._headers())
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"[AlpacaPaperClient] Error fetching positions: {e}")
        return []
