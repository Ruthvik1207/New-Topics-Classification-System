import os
import hashlib
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from backend.app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, index=True)
    article_hash = Column(String(64), index=True, nullable=False)
    article_snippet = Column(String(200), nullable=False)
    prediction = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    model_name = Column(String(100), default="news-topic-classifier")
    model_version = Column(String(50), default="v1.0")
    model_type = Column(String(50), default="DEMO MODEL")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actual_label = Column(String(50), nullable=True) # Feedback label
    feedback_at = Column(DateTime, nullable=True)


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def compute_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()
