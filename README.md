# AI Multi-Agent Algorithmic Paper-Trading System & Dashboard

A full-stack, modular algorithmic paper-trading platform orchestrated via **LangGraph**, governed by a **deterministic Python risk engine guardrail (no LLM calls)**, and displayed on a dark-mode **React + TypeScript + Tailwind CSS** dashboard.

---

## Key Architecture & Features

1. **Market Data Layer**:
   - `yfinance` live OHLCV price series and financial news ingestion with synthetic generator fallback.
   - Calculates **RSI (14)**, **MACD (12, 26, 9)**, **Bollinger Bands (20, 2 std)**, and **EMA 50 / 200**.

2. **LangGraph Stateful Multi-Agent Pipeline (`backend/agents/graph.py`)**:
   - **Node 1: Market Data & Technical Analyst**: Multi-factor trend strength scoring and indicator synthesis.
   - **Node 2: Sentiment & News Analyst**: Real-time ticker news scoring from `-1.0` (bearish) to `+1.0` (bullish).
   - **Node 3: Portfolio Strategist**: Combines technical trend and sentiment signals into a concrete `TradeOrder` proposal.
   - **Node 4: Deterministic Risk Guardrail**: Pure Python rule enforcement with zero LLM hallucination risk.

3. **Deterministic Guardrail Rules**:
   - **Rule 1 (Max Position Size)**: Max 5% of total portfolio equity (automatically scaled down if oversized).
   - **Rule 2 (Mandatory Stop-Loss)**: Stop-loss must exist on all BUY orders and cannot exceed 3% from entry.
   - **Rule 3 (Max Daily Drawdown)**: If portfolio daily drawdown $\ge 2\%$, trading is halted.
   - **Rule 4 (Confidence Floor)**: Strategy confidence must be $\ge 0.70$.
   - **Rule 5 (Cash Sufficiency)**: Verifies liquid cash balance.

4. **Execution & Persistence**:
   - SQLite (`trading_state.db`) via SQLAlchemy storing portfolio snapshots, positions, trade logs, and agent reasoning traces.
   - Default high-fidelity local SQLite Mock Exchange with initial $100,000 cash balance.
   - Seamless plug-in for Alpaca Paper Trading API via `.env`.

5. **Frontend Dashboard**:
   - Portfolio overview bar (Equity, Cash, Daily P&L, Win Rate).
   - Ticker control panel (`NVDA`, `AAPL`, `MSFT`, `BTC-USD`, `TSLA`, custom).
   - Live 4-node agent reasoning timeline with indicator pills and guardrail pass/fail chips.
   - Interactive price chart with indicator overlays and stop-loss / take-profit reference markers.
   - Active holdings and audit trade logs tables.

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
# Create and activate virtual environment (Python 3.11+)
py -3.13 -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run risk engine unit tests
pytest tests/test_risk_manager.py -v

# Start FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit dashboard at `http://localhost:5173`.
