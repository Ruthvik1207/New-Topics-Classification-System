import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import PredictionRecord, compute_hash
from backend.app.ml.predictor import predict_article_topic
from backend.app.ml.model_loader import ModelRegistry
from backend.app.schemas.prediction import PredictionResponse, PredictionHistoryItem
from backend.app.core.logging import logger

def perform_prediction(text: str, db: Session) -> PredictionResponse:
    # 1. Inference
    pred_data = predict_article_topic(text)
    
    registry = ModelRegistry.get_instance()
    metadata = registry.metadata
    model_version = metadata.get("model_version", "v1.0")
    model_name = metadata.get("model_name", "news-topic-classifier")
    
    # 2. Database record
    pred_id = str(uuid.uuid4())
    snippet = (text[:120] + "...") if len(text) > 120 else text
    text_hash = compute_hash(text)
    timestamp = datetime.now(timezone.utc).isoformat()

    record = PredictionRecord(
        id=pred_id,
        article_hash=text_hash,
        article_snippet=snippet,
        prediction=pred_data["prediction"],
        confidence=pred_data["confidence"],
        model_name=model_name,
        model_version=model_version,
        model_type=pred_data["model_type"],
        created_at=datetime.now(timezone.utc)
    )

    db.add(record)
    db.commit()

    return PredictionResponse(
        prediction_id=pred_id,
        prediction=pred_data["prediction"],
        confidence=pred_data["confidence"],
        probabilities=pred_data["probabilities"],
        model_name=model_name,
        model_version=model_version,
        model_type=pred_data["model_type"],
        timestamp=timestamp
    )

def get_recent_predictions(db: Session, limit: int = 10) -> List[PredictionHistoryItem]:
    records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    results = []
    for r in records:
        results.append(PredictionHistoryItem(
            id=r.id,
            snippet=r.article_snippet,
            prediction=r.prediction,
            confidence=round(r.confidence, 4),
            model_version=r.model_version,
            model_type=r.model_type,
            timestamp=r.created_at.isoformat() + "Z" if r.created_at else "",
            actual_label=r.actual_label
        ))
    return results

def get_prediction_metrics(db: Session) -> Dict[str, Any]:
    total_count = db.query(func.count(PredictionRecord.id)).scalar() or 0
    avg_confidence = db.query(func.avg(PredictionRecord.confidence)).scalar() or 0.0

    # Topic distribution from recent history
    cat_counts = (
        db.query(PredictionRecord.prediction, func.count(PredictionRecord.id))
        .group_by(PredictionRecord.prediction)
        .all()
    )
    distribution = {cat: count for cat, count in cat_counts}

    # Feedback counts
    feedback_count = db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.actual_label.isnot(None)).scalar() or 0

    return {
        "total_predictions": total_count,
        "average_confidence": round(float(avg_confidence), 4),
        "topic_distribution": distribution,
        "feedback_count": feedback_count
    }
