from fastapi import APIRouter
from backend.app.ml.model_loader import ModelRegistry
from backend.app.config import settings

router = APIRouter()

@router.get("/health", summary="Service Health Status")
def get_health():
    registry = ModelRegistry.get_instance()
    model_loaded = registry.model is not None
    meta = registry.metadata
    
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "model_loaded": model_loaded,
        "model_version": meta.get("model_version", settings.MODEL_VERSION),
        "model_type": registry.model_type,
        "environment": settings.APP_ENV
    }
