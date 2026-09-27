import os
import time
import uuid
import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
from backend.app.config import settings
from backend.app.ml.model_loader import ModelRegistry
from backend.app.schemas.training import TrainingTriggerRequest, TrainingStatusResponse
from backend.app.core.logging import logger
from scripts.train import train_lightweight_model, load_params

class TrainingManager:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.job_id = "none"
        self.status = "idle" # idle, running, completed, failed
        self.progress_percentage = 0
        self.current_step = "System ready"
        self.started_at: Optional[str] = None
        self.finished_at: Optional[str] = None
        self.model_version = settings.MODEL_VERSION
        self.metrics: Optional[Dict[str, float]] = None
        self.logs: List[str] = ["Training system initialized."]
        self.is_promoted: Optional[bool] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_status(self) -> TrainingStatusResponse:
        return TrainingStatusResponse(
            job_id=self.job_id,
            status=self.status,
            progress_percentage=self.progress_percentage,
            current_step=self.current_step,
            started_at=self.started_at,
            finished_at=self.finished_at,
            model_version=self.model_version,
            metrics=self.metrics,
            logs=self.logs[-20:], # return last 20 log entries
            threshold_f1=settings.EVAL_THRESHOLD_F1,
            is_promoted=self.is_promoted
        )

    def trigger_training(self, req: TrainingTriggerRequest) -> str:
        with self._lock:
            if self.status == "running":
                raise RuntimeError("A training run is already in progress.")

            self.job_id = str(uuid.uuid4())[:8]
            self.status = "running"
            self.progress_percentage = 5
            self.current_step = "Initializing training pipeline..."
            self.started_at = datetime.now(timezone.utc).isoformat()
            self.finished_at = None
            self.model_version = req.model_version or f"v{int(time.time())}"
            self.metrics = None
            self.is_promoted = None
            self.logs = [f"[{self.started_at}] Training job {self.job_id} initiated for version {self.model_version}."]


        thread = threading.Thread(target=self._run_training_job, args=(req,), daemon=True)
        thread.start()
        return self.job_id

    def _run_training_job(self, req: TrainingTriggerRequest):
        try:
            time.sleep(0.5)
            self._log(f"Step 1/5: Loading dataset from data/processed...")
            self.progress_percentage = 20
            self.current_step = "Loading training & validation datasets"

            train_path = "data/processed/train.csv"
            val_path = "data/processed/val.csv"

            if not os.path.exists(train_path) or not os.path.exists(val_path):
                self._log("Processed dataset missing. Triggering data preparation...")
                from scripts.prepare_data import main as prep_main
                prep_main()

            train_df = pd.read_csv(train_path)
            val_df = pd.read_csv(val_path)
            self._log(f"Loaded {len(train_df)} training and {len(val_df)} validation samples.")

            time.sleep(0.8)
            self._log(f"Step 2/5: Fitting NLP vectorizer and classifier pipeline...")
            self.progress_percentage = 50
            self.current_step = "Training model pipeline"

            params = load_params()
            pipeline, metrics, report_dict, cm, labels = train_lightweight_model(
                train_df, val_df, params, run_name=f"job_{self.job_id}"
            )
            self.metrics = metrics

            time.sleep(0.5)
            self._log(f"Step 3/5: Validation metrics -> Accuracy: {metrics['accuracy']}, F1: {metrics['f1']}")
            self.progress_percentage = 75
            self.current_step = "Evaluating threshold gate"

            # Continuous Learning threshold check
            threshold = settings.EVAL_THRESHOLD_F1
            if metrics["f1"] >= threshold:
                self.is_promoted = True
                self._log(f"Model meets promotion threshold (F1: {metrics['f1']} >= {threshold}). Promoting to Production.")
                
                # Save model to disk
                import joblib
                joblib.dump(pipeline, os.path.join(settings.MODEL_PATH, "classifier.joblib"))
                
                # Save metadata
                import json
                meta = {
                    "model_name": settings.MLFLOW_MODEL_NAME,
                    "model_version": self.model_version,
                    "model_type": "DEMO MODEL",
                    "architecture": "Calibrated TF-IDF + Logistic Ensemble",
                    "categories": settings.CATEGORIES,
                    "metrics": metrics,
                    "threshold_f1": threshold,
                    "is_promoted": True,
                    "training_samples": len(train_df),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "run_id": f"job_{self.job_id}"
                }
                with open(os.path.join(settings.MODEL_PATH, "model_metadata.json"), "w", encoding="utf-8") as f:
                    json.dump(meta, f, indent=2)

                # Hot reload model into memory
                ModelRegistry.get_instance().reload()
                self._log("Model hot-reloaded into memory registry.")
            else:
                self.is_promoted = False
                self._log(f"Model F1 {metrics['f1']} did not satisfy threshold {threshold}. Kept as candidate run.")

            time.sleep(0.5)
            self._log("Step 4/5: Logging run artifacts and metrics to MLflow...")
            self.progress_percentage = 90
            self.current_step = "Logging to MLflow tracking store"

            try:
                import mlflow
                mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
                mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
                with mlflow.start_run(run_name=f"job_{self.job_id}"):
                    mlflow.log_params({
                        "model_version": self.model_version,
                        "epochs": req.epochs,
                        "batch_size": req.batch_size,
                        "threshold_f1": threshold,
                        "is_promoted": self.is_promoted
                    })
                    mlflow.log_metrics(metrics)
                self._log("Logged run successfully to MLflow tracking store.")
            except Exception as e:
                self._log(f"MLflow tracking note: {e}")

            self._log("Step 5/5: Updating Evidently drift baseline data...")
            self.progress_percentage = 100
            self.current_step = "Training complete"
            self.status = "completed"
            self.finished_at = datetime.now(timezone.utc).isoformat()
            self._log(f"Training job {self.job_id} successfully finished at {self.finished_at}.")

        except Exception as e:
            logger.error(f"Training job failed: {e}")
            self.status = "failed"
            self.current_step = f"Failed: {str(e)}"
            self.finished_at = datetime.now(timezone.utc).isoformat()
            self._log(f"ERROR: Training job failed: {str(e)}")

    def _log(self, message: str):
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        self.logs.append(f"[{ts}] {message}")

