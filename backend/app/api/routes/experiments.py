from fastapi import APIRouter
from backend.app.services.mlflow_service import get_mlflow_experiments_data

router = APIRouter()

@router.get("/experiments", summary="Get MLflow Experiment Runs")
def get_experiments():
    data = get_mlflow_experiments_data()
    return {
        "status": "success",
        "tracking_uri": data["tracking_uri"],
        "experiment_name": data["experiment_name"],
        "runs": data["runs"]
    }

@router.get("/models", summary="Get Registered Models from MLflow Model Registry")
def get_registered_models():
    data = get_mlflow_experiments_data()
    return {
        "status": "success",
        "models": data["registry"]
    }
