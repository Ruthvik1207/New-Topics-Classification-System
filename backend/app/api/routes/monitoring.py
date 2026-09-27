import os
from fastapi import APIRouter, HTTPException, responses
from backend.app.schemas.monitoring import MonitoringResponse
from backend.app.services.monitoring_service import get_monitoring_data, get_html_report_path

router = APIRouter()

@router.get("/monitoring", response_model=MonitoringResponse, summary="Get Evidently AI Monitoring Status & Drift Metrics")
def get_monitoring():
    try:
        data = get_monitoring_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring error: {str(e)}")

@router.get("/monitoring/report", summary="View Standalone Evidently HTML Report")
def get_monitoring_report():
    html_path = get_html_report_path()
    if html_path and os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()
        return responses.HTMLResponse(content=content)
    raise HTTPException(status_code=404, detail="Evidently HTML report not generated yet")
