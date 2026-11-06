import httpx
from typing import Dict, Any, Optional
from backend.config import settings

class AlpacaPaperClient:
    def __init__(self):
        self.api_key = settings.ALPACA_API_KEY
        self.secret_key = settings.ALPACA_SECRET_KEY
        self.base_url = settings.ALPACA_BASE_URL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.secret_key)

    def _headers(self) -> Dict[str, str]:
        return {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.secret_key,
            "Content-Type": "application/json"
        }

    async def get_account(self) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/account", headers=self._headers())
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"[AlpacaPaperClient] Error fetching account: {e}")
        return None

    async def submit_order(
        self,
        ticker: str,
        qty: int,
        side: str,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        payload: Dict[str, Any] = {
            "symbol": ticker.upper(),
            "qty": qty,
            "side": side.lower(),
            "type": "market",
            "time_in_force": "day"
        }
        if stop_loss:
            payload["stop_loss"] = {"stop_price": round(stop_loss, 2)}
        if take_profit:
            payload["take_profit"] = {"limit_price": round(take_profit, 2)}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/orders", json=payload, headers=self._headers())
                if res.status_code in (200, 201):
                    return res.json()
        except Exception as e:
            print(f"[AlpacaPaperClient] Error submitting order: {e}")
        return None
