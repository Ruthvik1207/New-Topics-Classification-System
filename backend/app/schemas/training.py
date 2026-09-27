from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TrainingTriggerRequest(BaseModel):
    model_version: Optional[str] = Field("v1.1", description="Target model version identifier")
    use_transformer: Optional[bool] = Field(False, description="Fine-tune HuggingFace transformer model if True")
    epochs: Optional[int] = Field(3, ge=1, le=10)
    batch_size: Optional[int] = Field(16, ge=1, le=64)
    learning_rate: Optional[float] = Field(3e-5, gt=0, lt=1)

class TrainingStatusResponse(BaseModel):
    job_id: str
    status: str  # "idle", "running", "completed", "failed"
    progress_percentage: int
    current_step: str
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    model_version: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None
    logs: List[str] = []
    threshold_f1: float
    is_promoted: Optional[bool] = None
