from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse, PredictionHistoryItem
from backend.app.services.inference_service import perform_prediction, get_recent_predictions, get_prediction_metrics
from typing import List

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK, summary="Classify News Article")
def predict_topic(req: PredictionRequest, db: Session = Depends(get_db)):
    if not req.text or len(req.text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Article text must be at least 10 characters long"
        )
    if len(req.text) > 50000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Article text exceeds maximum allowed length of 50,000 characters"
        )

    try:
        response = perform_prediction(req.text, db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(e)}"
        )

@router.get("/predictions/recent", response_model=List[PredictionHistoryItem], summary="Get Recent Predictions")
def get_recent(limit: int = 10, db: Session = Depends(get_db)):
    return get_recent_predictions(db, limit=min(limit, 100))

@router.get("/predictions/stats", summary="Get Inference Summary Statistics")
def get_stats(db: Session = Depends(get_db)):
    return get_prediction_metrics(db)
