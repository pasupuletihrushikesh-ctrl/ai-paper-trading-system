from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.routers import portfolio, trading, market, settings as settings_router
from backend.config import settings

app = FastAPI(
    title="AI Multi-Agent Paper-Trading System API",
    description="Stateful LangGraph multi-agent paper trading system with deterministic Python risk engine guardrail",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(portfolio.router)
app.include_router(trading.router)
app.include_router(market.router)
app.include_router(settings_router.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "AI Multi-Agent Paper-Trading Agent",
        "mock_exchange_active": True,
        "alpaca_configured": settings.has_alpaca_credentials,
        "gemini_configured": settings.has_gemini_credentials
    }

@app.get("/api/health")
def health():
    return {"status": "HEALTHY", "code": 200}
