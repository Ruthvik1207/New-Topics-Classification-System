from typing import Dict, Any, Optional
from pydantic import BaseModel

class FeatureDriftItem(BaseModel):
    drift_detected: bool
    score: float

class MonitoringResponse(BaseModel):
    status: str  # "Healthy", "Warning", "Critical"
    timestamp: str
    reference_samples: int
    current_samples: int
    metrics: Dict[str, float]
    feature_drift: Dict[str, FeatureDriftItem]
    category_distributions: Dict[str, Dict[str, float]]
    html_report_available: bool
