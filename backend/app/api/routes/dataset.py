from fastapi import APIRouter
from backend.app.services.dataset_service import get_dataset_metadata

router = APIRouter()

@router.get("/dataset", summary="Get DVC Dataset Metadata & Versioning")
def get_dataset():
    return get_dataset_metadata()
