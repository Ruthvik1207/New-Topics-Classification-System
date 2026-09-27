from typing import Optional
from pydantic import BaseModel, Field

class FeedbackRequest(BaseModel):
    prediction_id: str = Field(..., description="ID of the prediction to record feedback for")
    actual_label: str = Field(..., description="The verified ground truth category for the article")

class FeedbackResponse(BaseModel):
    status: str
    message: str
    prediction_id: str
    predicted_label: str
    actual_label: str
    updated_at: str
