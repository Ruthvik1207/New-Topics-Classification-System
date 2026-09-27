#!/usr/bin/env python3
"""
Model Evaluation Script for NewsLens AI
Evaluates model on the held-out test split (data/processed/test.csv)
Generates evaluation metrics and confusion matrix.
"""

import os
import json
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

def main():
    test_path = os.path.join("data", "processed", "test.csv")
    model_path = os.path.join("models", "classifier.joblib")
    meta_path = os.path.join("models", "model_metadata.json")

    if not os.path.exists(test_path):
        print(f"Error: {test_path} not found.")
        return

    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found. Please train model first.")
        return

    print(">>> Evaluating model on test set...")
    test_df = pd.read_csv(test_path)
    model = joblib.load(model_path)

    y_true = test_df["label"]
    y_pred = model.predict(test_df["text"])

    acc = accuracy_score(y_true, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    
    labels = sorted(list(set(y_true)))
    cm = confusion_matrix(y_true, y_pred, labels=labels).tolist()
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)

    eval_results = {
        "test_samples": len(test_df),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "labels": labels,
        "confusion_matrix": cm,
        "classification_report": report
    }

    eval_out = os.path.join("models", "evaluation_report.json")
    with open(eval_out, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print(f"Test Set Evaluation Results: Accuracy={acc:.4f}, Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}")
    print(f"Saved evaluation report to {eval_out}")

if __name__ == "__main__":
    main()
