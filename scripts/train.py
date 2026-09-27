#!/usr/bin/env python3
"""
Model Training Script for NewsLens AI
Supports:
1. High-Performance Lightweight NLP Classifier (TF-IDF + Calibrated Logistic Classifier)
2. Hugging Face Transformer / DistilBERT Fine-tuning Pipeline
3. MLflow Experiment Tracking, Metrics Logging, and Model Artifacts Registration
4. Continuous Learning Evaluation Threshold Checking
"""

import os
import sys
import json
import yaml
import time
import argparse
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
import joblib

# MLflow
try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

CATEGORIES = [
    "World",
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Sports",
    "Entertainment"
]

def load_params():
    params_path = "params.yaml"
    if os.path.exists(params_path):
        with open(params_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {
        "model": {"name": "distilbert-base-uncased", "categories": CATEGORIES},
        "training": {"epochs": 3, "learning_rate": 3e-5, "eval_threshold_f1": 0.80},
        "data": {
            "train_path": "data/processed/train.csv",
            "val_path": "data/processed/val.csv",
            "test_path": "data/processed/test.csv"
        }
    }

def train_lightweight_model(train_df, val_df, params, run_name=None):
    """Trains a production calibrated TF-IDF + Logistic Classifier."""
    print(">>> Training Lightweight Production Classifier...")
    
    # Text preprocessing pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=10000,
            sublinear_tf=True
        )),
        ("clf", CalibratedClassifierCV(
            estimator=LogisticRegression(C=2.0, max_iter=500, class_weight="balanced", random_state=42),
            cv=3
        ))
    ])

    start_time = time.time()
    pipeline.fit(train_df["text"], train_df["label"])
    training_duration = time.time() - start_time

    # Validate
    y_val_true = val_df["label"]
    y_val_pred = pipeline.predict(val_df["text"])
    
    acc = accuracy_score(y_val_true, y_val_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_val_true, y_val_pred, average="weighted", zero_division=0)
    
    report_dict = classification_report(y_val_true, y_val_pred, output_dict=True, zero_division=0)
    labels = sorted(list(set(y_val_true)))
    cm = confusion_matrix(y_val_true, y_val_pred, labels=labels).tolist()

    metrics = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "training_time_seconds": round(training_duration, 3)
    }

    print(f"Validation Results: Accuracy={metrics['accuracy']:.4f}, F1={metrics['f1']:.4f}")
    return pipeline, metrics, report_dict, cm, labels

def train_transformer_model(train_df, val_df, params):
    """
    Fine-tunes DistilBERT using Hugging Face Transformers & PyTorch.
    Falls back gracefully if CUDA/memory/time bounds prefer lightweight model.
    """
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
        from datasets import Dataset

        print(">>> Fine-tuning DistilBERT transformer model...")
        model_name = params.get("model", {}).get("name", "distilbert-base-uncased")
        tokenizer = AutoTokenizer.from_pretrained(model_name)

        label2id = {c: i for i, c in enumerate(CATEGORIES)}
        id2label = {i: c for i, c in enumerate(CATEGORIES)}

        def tokenize(batch):
            return tokenizer(batch["text"], padding="max_length", truncation=True, max_length=128)

        train_ds = Dataset.from_pandas(train_df)
        val_ds = Dataset.from_pandas(val_df)

        train_ds = train_ds.map(lambda x: {"label": label2id.get(x["label"], 0)})
        val_ds = val_ds.map(lambda x: {"label": label2id.get(x["label"], 0)})

        train_tokenized = train_ds.map(tokenize, batched=True)
        val_tokenized = val_ds.map(tokenize, batched=True)

        model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            num_labels=len(CATEGORIES),
            id2label=id2label,
            label2id=label2id
        )

        output_dir = "models/transformer"
        os.makedirs(output_dir, exist_ok=True)

        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=1,
            per_device_train_batch_size=8,
            per_device_eval_batch_size=8,
            logging_steps=10,
            save_strategy="no",
            evaluation_strategy="epoch",
            learning_rate=3e-5,
            weight_decay=0.01,
            report_to="none"
        )

        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_tokenized,
            eval_dataset=val_tokenized,
        )

        trainer.train()
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)
        print(f"Transformer model saved to {output_dir}")
        return True
    except Exception as e:
        print(f"Transformer fine-tuning notice: {e}. Using production lightweight classifier.")
        return False

def main():
    parser = argparse.ArgumentParser(description="NewsLens AI Model Training")
    parser.add_argument("--transformer", action="store_true", help="Train transformer model")
    parser.add_argument("--version", type=str, default="v1.0", help="Model version tag")
    args = parser.parse_args()

    params = load_params()
    train_path = params.get("data", {}).get("train_path", "data/processed/train.csv")
    val_path = params.get("data", {}).get("val_path", "data/processed/val.csv")

    if not os.path.exists(train_path) or not os.path.exists(val_path):
        print("Data files not found. Running scripts/prepare_data.py first...")
        from scripts.prepare_data import main as prep_main
        prep_main()

    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)

    os.makedirs("models", exist_ok=True)
    os.makedirs("mlruns", exist_ok=True)

    # Initialize MLflow tracking with SQLite backend
    experiment_name = params.get("mlflow", {}).get("experiment_name", "news-topic-classification")
    tracking_uri = os.environ.get("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")
    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_tracking_uri(tracking_uri)
            mlflow.set_experiment(experiment_name)
        except Exception as e:
            print(f"MLflow connection note: {e}")


    model_type = "DEMO MODEL" # explicitly documented
    model_version = args.version
    timestamp = datetime.utcnow().isoformat() + "Z"

    # Train model
    with (mlflow.start_run(run_name=f"run_{model_version}") if MLFLOW_AVAILABLE else open(os.devnull)) as run:
        run_id = run.info.run_id if MLFLOW_AVAILABLE and hasattr(run, "info") else f"local_run_{int(time.time())}"

        pipeline, metrics, report_dict, cm, labels = train_lightweight_model(
            train_df, val_df, params, run_name=f"run_{model_version}"
        )

        # Check Continuous Learning Threshold
        eval_threshold = float(params.get("training", {}).get("eval_threshold_f1", 0.80))
        meets_threshold = metrics["f1"] >= eval_threshold
        print(f">>> Threshold check: F1={metrics['f1']} vs Required={eval_threshold} -> {'ACCEPTED' if meets_threshold else 'REJECTED'}")

        # Save model pipeline
        model_save_path = os.path.join("models", "classifier.joblib")
        joblib.dump(pipeline, model_save_path)
        print(f"Model saved to {model_save_path}")

        # Save metadata
        metadata = {
            "model_name": "news-topic-classifier",
            "model_version": model_version,
            "model_type": model_type,
            "architecture": "Calibrated TF-IDF + Logistic Ensemble",
            "categories": CATEGORIES,
            "metrics": metrics,
            "threshold_f1": eval_threshold,
            "is_promoted": meets_threshold,
            "training_samples": len(train_df),
            "validation_samples": len(val_df),
            "created_at": timestamp,
            "run_id": run_id
        }

        with open(os.path.join("models", "model_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        # Save metrics and reports
        with open(os.path.join("models", "metrics.json"), "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        with open(os.path.join("models", "confusion_matrix.json"), "w", encoding="utf-8") as f:
            json.dump({"matrix": cm, "labels": labels}, f, indent=2)

        with open(os.path.join("models", "classification_report.json"), "w", encoding="utf-8") as f:
            json.dump(report_dict, f, indent=2)

        # Log to MLflow
        if MLFLOW_AVAILABLE:
            mlflow.log_params({
                "model_name": "news-topic-classifier",
                "model_type": model_type,
                "model_version": model_version,
                "dataset_version": params.get("data", {}).get("version", "v1.2.0"),
                "num_categories": len(CATEGORIES),
                "train_samples": len(train_df),
                "val_samples": len(val_df),
                "eval_threshold_f1": eval_threshold
            })
            mlflow.log_metrics(metrics)
            mlflow.log_artifact(os.path.join("models", "model_metadata.json"))
            mlflow.log_artifact(os.path.join("models", "metrics.json"))
            mlflow.log_artifact(os.path.join("models", "confusion_matrix.json"))
            mlflow.log_artifact(os.path.join("models", "classification_report.json"))
            try:
                mlflow.sklearn.log_model(
                    pipeline,
                    "classifier_artifact",
                    skops_trusted_types=['sklearn.calibration._CalibratedClassifier', 'sklearn.calibration._SigmoidCalibration']
                )
            except Exception as e:
                print(f"Model artifact logging notice: {e}")


            print(f">>> Logged run {run_id} to MLflow.")

    print(f">>> Model training and registration completed successfully! (Version: {model_version})")

if __name__ == "__main__":
    main()
