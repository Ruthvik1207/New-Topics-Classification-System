import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "New Topics Classification System"
    APP_ENV: str = os.getenv("APP_ENV", "development")

    API_PORT: int = int(os.getenv("API_PORT", 8000))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./news_classifier.db")
    
    # MLflow
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")
    MLFLOW_EXPERIMENT_NAME: str = os.getenv("MLFLOW_EXPERIMENT_NAME", "news-topic-classification")
    MLFLOW_MODEL_NAME: str = os.getenv("MLFLOW_MODEL_NAME", "news-topic-classifier")
    
    # Model
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v1.0")
    EVAL_THRESHOLD_F1: float = float(os.getenv("EVAL_THRESHOLD_F1", 0.80))
    USE_TRANSFORMER_IF_AVAILABLE: bool = os.getenv("USE_TRANSFORMER_IF_AVAILABLE", "true").lower() == "true"
    
    # Categories (configurable without code rewrites)
    CATEGORIES: List[str] = [
        "World",
        "Politics",
        "Business",
        "Technology",
        "Science",
        "Health",
        "Sports",
        "Entertainment"
    ]
    
    # Monitoring
    EVIDENTLY_REPORT_PATH: str = os.getenv("EVIDENTLY_REPORT_PATH", "./monitoring/reports")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
