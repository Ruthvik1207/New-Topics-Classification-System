from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.training import TrainingTriggerRequest, TrainingStatusResponse
from backend.app.services.training_service import TrainingManager

router = APIRouter()

@router.post("/train", status_code=status.HTTP_202_ACCEPTED, summary="Trigger Continuous Learning Training Run")
def trigger_training(req: TrainingTriggerRequest):
    manager = TrainingManager.get_instance()
    try:
        job_id = manager.trigger_training(req)
        return {
            "status": "accepted",
            "message": "Training pipeline initiated in background worker",
            "job_id": job_id,
            "target_model_version": req.model_version
        }
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start training: {str(e)}"
        )

@router.get("/training/status", response_model=TrainingStatusResponse, summary="Get Current Training Pipeline Status")
def get_training_status():
    manager = TrainingManager.get_instance()
    return manager.get_status()
