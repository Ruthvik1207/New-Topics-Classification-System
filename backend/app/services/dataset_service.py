import os
import pandas as pd
from typing import Dict, Any
from backend.app.config import settings

def get_dataset_metadata() -> Dict[str, Any]:
    raw_path = "data/raw/news.csv"
    train_path = "data/processed/train.csv"
    val_path = "data/processed/val.csv"
    test_path = "data/processed/test.csv"
    ref_path = "data/reference/reference_dataset.csv"

    raw_count = 0
    raw_size_kb = 0.0
    category_counts = {}

    if os.path.exists(raw_path):
        raw_size_kb = round(os.path.getsize(raw_path) / 1024, 2)
        try:
            df = pd.read_csv(raw_path)
            raw_count = len(df)
            category_counts = df["label"].value_counts().to_dict()
        except Exception:
            pass

    train_count = len(pd.read_csv(train_path)) if os.path.exists(train_path) else 0
    val_count = len(pd.read_csv(val_path)) if os.path.exists(val_path) else 0
    test_count = len(pd.read_csv(test_path)) if os.path.exists(test_path) else 0

    return {
        "dvc_version": "v1.2.0",
        "dvc_tracked": os.path.exists("dvc.yaml"),
        "raw_samples": raw_count,
        "raw_size_kb": raw_size_kb,
        "splits": {
            "train": train_count,
            "validation": val_count,
            "test": test_count
        },
        "num_categories": len(settings.CATEGORIES),
        "categories": settings.CATEGORIES,
        "category_distribution": category_counts,
        "last_updated": "2026-09-27T19:23:33Z"
    }
