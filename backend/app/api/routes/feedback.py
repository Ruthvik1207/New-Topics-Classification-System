from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db, PredictionRecord
from backend.app.schemas.feedback import FeedbackRequest, FeedbackResponse
from backend.app.config import settings

router = APIRouter()

@router.post("/feedback", response_model=FeedbackResponse, summary="Submit Label Feedback for Prediction")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    if req.actual_label not in settings.CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid label '{req.actual_label}'. Must be one of: {', '.join(settings.CATEGORIES)}"
        )

    record = db.query(PredictionRecord).filter(PredictionRecord.id == req.prediction_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID '{req.prediction_id}' not found"
        )

    record.actual_label = req.actual_label
    record.feedback_at = datetime.now(timezone.utc)
    db.commit()


    return FeedbackResponse(
        status="success",
        message="Feedback recorded for continuous learning retraining pool",
        prediction_id=record.id,
        predicted_label=record.prediction,
        actual_label=req.actual_label,
        updated_at=record.feedback_at.isoformat() + "Z"
    )
