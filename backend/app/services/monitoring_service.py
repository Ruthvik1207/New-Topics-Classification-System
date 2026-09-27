import os
import json
from typing import Dict, Any, Optional
from backend.app.config import settings
from monitoring.scripts.generate_drift_report import generate_drift_analysis

def get_monitoring_data() -> Dict[str, Any]:
    summary_path = os.path.join(settings.EVIDENTLY_REPORT_PATH, "drift_summary.json")
    if os.path.exists(summary_path):
        try:
            with open(summary_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    
    # Generate fresh analysis if not cached
    return generate_drift_analysis()

def get_html_report_path() -> Optional[str]:
    report_path = os.path.join(settings.EVIDENTLY_REPORT_PATH, "drift_report.html")
    if os.path.exists(report_path):
        return report_path
    return None
