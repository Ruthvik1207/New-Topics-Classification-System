from typing import Dict, Optional, List
from pydantic import BaseModel, Field, field_validator

class PredictionRequest(BaseModel):
    text: str = Field(..., description="The full news article text to classify", min_length=10, max_length=50000)

    @field_validator("text")
    def text_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("News article text cannot be empty or purely whitespace")
        return stripped

class PredictionResponse(BaseModel):
    prediction_id: str
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    model_name: str
    model_version: str
    model_type: str  # "DEMO MODEL" or "BERT MODEL"
    timestamp: str

class PredictionHistoryItem(BaseModel):
    id: str
    snippet: str
    prediction: str
    confidence: float
    model_version: str
    model_type: str
    timestamp: str
    actual_label: Optional[str] = None
