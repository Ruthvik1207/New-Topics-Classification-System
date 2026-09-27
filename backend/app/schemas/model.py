from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class MetricsSchema(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    training_time_seconds: Optional[float] = None

class ModelMetadataResponse(BaseModel):
    model_name: str
    model_version: str
    model_type: str  # "DEMO MODEL" or "BERT MODEL"
    architecture: str
    categories: List[str]
    metrics: MetricsSchema
    is_promoted: bool
    threshold_f1: float
    training_samples: int
    created_at: str
    run_id: Optional[str] = None
    status: str
