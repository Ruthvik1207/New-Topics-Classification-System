import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import init_db
from backend.app.ml.model_loader import ModelRegistry
from backend.app.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    init_db()
    ModelRegistry.get_instance().load()

@pytest.fixture
def client():
    return TestClient(app)

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert data["model_loaded"] is True
    assert "model_type" in data

def test_model_metadata_endpoint(client):
    response = client.get("/api/v1/model")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == settings.MLFLOW_MODEL_NAME
    assert len(data["categories"]) == 8
    assert "metrics" in data
    assert data["metrics"]["accuracy"] > 0.5
    assert data["metrics"]["f1"] > 0.5

def test_predict_endpoint_valid_article(client):
    article_text = (
        "Researchers at the institute announced a breakthrough in artificial intelligence "
        "and quantum computing hardware, showing dramatic speed improvements for neural networks."
    )
    response = client.post("/api/v1/predict", json={"text": article_text})
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert "probabilities" in data
    assert len(data["probabilities"]) == 8
    # Check probability sum close to 1.0
    prob_sum = sum(data["probabilities"].values())
    assert abs(prob_sum - 1.0) < 0.05
    assert "prediction_id" in data
    assert data["prediction"] in settings.CATEGORIES

def test_predict_endpoint_short_input_fails(client):
    response = client.post("/api/v1/predict", json={"text": "Short"})
    assert response.status_code == 422

def test_predict_endpoint_empty_input_fails(client):
    response = client.post("/api/v1/predict", json={"text": "   "})
    assert response.status_code == 422

def test_feedback_endpoint(client):
    # First make a prediction to get an ID
    pred_res = client.post("/api/v1/predict", json={
        "text": "The central bank unexpectedly raised interest rates today amid surging inflation numbers."
    })
    assert pred_res.status_code == 200
    pred_id = pred_res.json()["prediction_id"]

    # Now submit feedback
    feedback_res = client.post("/api/v1/feedback", json={
        "prediction_id": pred_id,
        "actual_label": "Business"
    })
    assert feedback_res.status_code == 200
    fb_data = feedback_res.json()
    assert fb_data["status"] == "success"
    assert fb_data["actual_label"] == "Business"

def test_feedback_invalid_label(client):
    response = client.post("/api/v1/feedback", json={
        "prediction_id": "non-existent-id",
        "actual_label": "InvalidCategoryName"
    })
    assert response.status_code == 400

def test_monitoring_endpoint(client):
    response = client.get("/api/v1/monitoring")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["Healthy", "Warning", "Critical"]
    assert "feature_drift" in data
    assert "category_distributions" in data

def test_dataset_endpoint(client):
    response = client.get("/api/v1/dataset")
    assert response.status_code == 200
    data = response.json()
    assert "dvc_version" in data
    assert "splits" in data
    assert data["num_categories"] == 8

def test_experiments_endpoint(client):
    response = client.get("/api/v1/experiments")
    assert response.status_code == 200
    data = response.json()
    assert "runs" in data

def test_training_status_endpoint(client):
    response = client.get("/api/v1/training/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "threshold_f1" in data
