#!/usr/bin/env python3
"""
Evidently AI Monitoring & Data Drift Service
Calculates:
- Text length & vocabulary drift
- Prediction distribution drift
- Confidence distribution drift
- Missing values / quality checks
- Status: Healthy / Warning / Critical
Saves interactive HTML report and JSON summary.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
import joblib

try:
    from evidently.report import Report
    from evidently.metric_preset import DataDriftPreset, DataQualityPreset
    EVIDENTLY_AVAILABLE = True
except ImportError:
    EVIDENTLY_AVAILABLE = False

REPORTS_DIR = os.path.join("monitoring", "reports")
REFERENCE_PATH = os.path.join("data", "reference", "reference_dataset.csv")
MODEL_PATH = os.path.join("models", "classifier.joblib")

def generate_drift_analysis(current_data: pd.DataFrame = None, reference_data: pd.DataFrame = None):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # If reference not provided, load reference dataset
    if reference_data is None:
        if os.path.exists(REFERENCE_PATH):
            reference_data = pd.read_csv(REFERENCE_PATH)
        else:
            reference_data = pd.DataFrame({"text": ["Sample article for reference baseline"] * 20, "label": ["Technology"] * 20})
            
    # If current not provided, use validation / simulated recent production traffic
    if current_data is None:
        val_path = os.path.join("data", "processed", "val.csv")
        if os.path.exists(val_path):
            current_data = pd.read_csv(val_path).copy()
        else:
            current_data = reference_data.copy()

    # Load model for computing predictions and confidences
    model = None
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
        except Exception:
            pass

    # Extract feature metrics: text length, word count
    ref_df = pd.DataFrame()
    ref_df["text_len"] = reference_data["text"].astype(str).str.len()
    ref_df["word_count"] = reference_data["text"].astype(str).str.split().str.len()

    curr_df = pd.DataFrame()
    curr_df["text_len"] = current_data["text"].astype(str).str.len()
    curr_df["word_count"] = current_data["text"].astype(str).str.split().str.len()

    # Model inference for reference and current
    if model is not None:
        ref_preds = model.predict(reference_data["text"])
        ref_probs = model.predict_proba(reference_data["text"])
        ref_df["prediction"] = ref_preds
        ref_df["confidence"] = np.max(ref_probs, axis=1)

        curr_preds = model.predict(current_data["text"])
        curr_probs = model.predict_proba(current_data["text"])
        curr_df["prediction"] = curr_preds
        curr_df["confidence"] = np.max(curr_probs, axis=1)
    else:
        ref_df["prediction"] = reference_data.get("label", "Unknown")
        ref_df["confidence"] = 0.95
        curr_df["prediction"] = current_data.get("label", "Unknown")
        curr_df["confidence"] = 0.94

    # Calculate drift metrics (Kolmogorov-Smirnov test for continuous, Wasserstein / Chi-sq for categorical)
    from scipy.stats import ks_2samp

    ks_len = ks_2samp(ref_df["text_len"], curr_df["text_len"])
    ks_word = ks_2samp(ref_df["word_count"], curr_df["word_count"])
    ks_conf = ks_2samp(ref_df["confidence"], curr_df["confidence"])

    # Categorical distribution drift (Total Variation Distance)
    categories = sorted(list(set(ref_df["prediction"]).union(set(curr_df["prediction"]))))
    ref_cat_dist = ref_df["prediction"].value_counts(normalize=True).to_dict()
    curr_cat_dist = curr_df["prediction"].value_counts(normalize=True).to_dict()

    cat_drift_score = 0.5 * sum(abs(ref_cat_dist.get(c, 0.0) - curr_cat_dist.get(c, 0.0)) for c in categories)

    # Determine overall drift status
    # Healthy: low drift; Warning: moderate drift; Critical: severe drift
    p_min = min(ks_len.pvalue, ks_word.pvalue, ks_conf.pvalue)
    
    if p_min < 0.01 or cat_drift_score > 0.40:
        drift_status = "Critical"
    elif p_min < 0.05 or cat_drift_score > 0.20:
        drift_status = "Warning"
    else:
        drift_status = "Healthy"

    # Evidently HTML report generation
    html_report_path = os.path.join(REPORTS_DIR, "drift_report.html")
    if EVIDENTLY_AVAILABLE:
        try:
            report = Report(metrics=[DataDriftPreset()])
            report.run(reference_data=ref_df, current_data=curr_df)
            report.save_html(html_report_path)
        except Exception as e:
            # Fallback custom standalone glass HTML report
            write_fallback_html_report(html_report_path, drift_status, p_min, cat_drift_score)
    else:
        write_fallback_html_report(html_report_path, drift_status, p_min, cat_drift_score)

    summary = {
        "status": drift_status,
        "timestamp": datetime.now().isoformat() + "Z",
        "reference_samples": len(ref_df),
        "current_samples": len(curr_df),
        "metrics": {
            "text_length_p_value": round(float(ks_len.pvalue), 4),
            "word_count_p_value": round(float(ks_word.pvalue), 4),
            "confidence_drift_p_value": round(float(ks_conf.pvalue), 4),
            "category_drift_score": round(float(cat_drift_score), 4),
            "average_confidence_reference": round(float(ref_df["confidence"].mean()), 4),
            "average_confidence_current": round(float(curr_df["confidence"].mean()), 4),
        },
        "feature_drift": {
            "text_length": {"drift_detected": bool(ks_len.pvalue < 0.05), "score": round(float(ks_len.statistic), 4)},
            "word_count": {"drift_detected": bool(ks_word.pvalue < 0.05), "score": round(float(ks_word.statistic), 4)},
            "prediction_confidence": {"drift_detected": bool(ks_conf.pvalue < 0.05), "score": round(float(ks_conf.statistic), 4)},
            "category_distribution": {"drift_detected": bool(cat_drift_score > 0.20), "score": round(float(cat_drift_score), 4)}
        },
        "category_distributions": {
            "reference": {c: round(float(ref_cat_dist.get(c, 0)), 4) for c in categories},
            "current": {c: round(float(curr_cat_dist.get(c, 0)), 4) for c in categories}
        },
        "html_report_available": os.path.exists(html_report_path)
    }

    # Save JSON summary
    summary_path = os.path.join(REPORTS_DIR, "drift_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary

def write_fallback_html_report(path, status, p_min, cat_drift):
    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NewsLens AI Monitoring Report</title>
  <style>
    body {{ background: #070913; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; }}
    .card {{ background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }}
    .badge {{ display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; background: {'#10b981' if status=='Healthy' else '#f59e0b' if status=='Warning' else '#ef4444'}; color: #fff; }}
  </style>
</head>
<body>
  <h1>NewsLens AI - Evidently Monitoring Report</h1>
  <div class="card">
    <h2>Monitoring Status: <span class="badge">{status}</span></h2>
    <p>Min P-Value: {p_min:.4f} | Category Drift TVD: {cat_drift:.4f}</p>
    <p>Report generated at {datetime.now().isoformat()}Z</p>
  </div>
</body>
</html>"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    summary = generate_drift_analysis()
    print("Evidently Drift Analysis Complete:")
    print(json.dumps(summary, indent=2))
