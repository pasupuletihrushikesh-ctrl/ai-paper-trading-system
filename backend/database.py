from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings
import os

db_url = f"sqlite:///{settings.DB_FILE}"
engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from backend.models import db_models
    Base.metadata.create_all(bind=engine)
    # Seed initial portfolio state if empty
    db = SessionLocal()
    try:
        portfolio = db.query(db_models.PortfolioSnapshot).order_by(db_models.PortfolioSnapshot.id.desc()).first()
        if not portfolio:
            initial = db_models.PortfolioSnapshot(
                total_equity=settings.DEFAULT_INITIAL_CASH,
                cash_balance=settings.DEFAULT_INITIAL_CASH,
                daily_start_equity=settings.DEFAULT_INITIAL_CASH,
                daily_pnl=0.0,
                daily_pnl_pct=0.0,
                win_rate=0.0,
                closed_trades_count=0,
                winning_trades_count=0
            )
            db.add(initial)
            db.commit()
    finally:
        db.close()
