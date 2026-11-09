from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.config import settings, ENV_PATH
from backend.services.alpaca_client import AlpacaPaperClient

router = APIRouter(prefix="/api/settings", tags=["Settings & Credentials"])

class CredentialsUpdateRequest(BaseModel):
    alpaca_api_key: Optional[str] = None
    alpaca_secret_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

class TestAlpacaRequest(BaseModel):
    api_key: Optional[str] = None
    secret_key: Optional[str] = None

@router.get("/credentials")
def get_credentials_status() -> Dict[str, Any]:
    """
    Returns masked privacy credentials status and live connection status.
    Never exposes raw secrets over the wire.
    """
    alpaca_key = settings.ALPACA_API_KEY
    alpaca_secret = settings.ALPACA_SECRET_KEY
    gemini_key = settings.GEMINI_API_KEY

    masked_alpaca = f"{alpaca_key[:4]}••••••••{alpaca_key[-4:]}" if len(alpaca_key) >= 8 else ("Configured" if alpaca_key else "")
    masked_gemini = f"{gemini_key[:4]}••••••••{gemini_key[-4:]}" if len(gemini_key) >= 8 else ("Configured" if gemini_key else "")

    alpaca_client = AlpacaPaperClient()
    alpaca_info = alpaca_client.test_connection() if alpaca_client.is_configured else {
        "connected": False,
        "message": "Not configured. Using local SQLite Mock Exchange."
    }

    return {
        "env_path": str(ENV_PATH),
        "alpaca_configured": settings.has_alpaca_credentials,
        "alpaca_key_masked": masked_alpaca,
        "alpaca_secret_set": bool(alpaca_secret),
        "alpaca_base_url": settings.ALPACA_BASE_URL,
        "gemini_configured": settings.has_gemini_credentials,
        "gemini_key_masked": masked_gemini,
        "alpaca_connection": alpaca_info
    }

@router.post("/credentials")
def update_credentials(payload: CredentialsUpdateRequest) -> Dict[str, Any]:
    """
    Updates .env file with new credentials and reloads settings.
    """
    try:
        settings.update_credentials(
            alpaca_key=payload.alpaca_api_key,
            alpaca_secret=payload.alpaca_secret_key,
            gemini_key=payload.gemini_api_key
        )

        alpaca_client = AlpacaPaperClient()
        test_res = alpaca_client.test_connection() if alpaca_client.is_configured else {
            "connected": False,
            "message": "Credentials updated, but Alpaca keys are empty."
        }

        return {
            "status": "SUCCESS",
            "message": "Credentials successfully updated in .env and reloaded.",
            "alpaca_connection": test_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update credentials: {str(e)}")

@router.post("/test-alpaca")
def test_alpaca_credentials(payload: TestAlpacaRequest) -> Dict[str, Any]:
    """
    Directly tests given or existing Alpaca credentials without permanently saving.
    """
    client = AlpacaPaperClient(
        api_key=payload.api_key or settings.ALPACA_API_KEY,
        secret_key=payload.secret_key or settings.ALPACA_SECRET_KEY,
        base_url=settings.ALPACA_BASE_URL
    )
    return client.test_connection()
