#!/usr/bin/env bash
# NewsLens AI - Service Launcher for Linux / macOS
echo "=========================================================="
echo " NewsLens AI - Continuous Learning NLP System Launcher   "
echo "=========================================================="

source .venv/bin/activate 2>/dev/null || true

# 1. Start MLflow
echo "[1/3] Starting MLflow Tracking Server on http://localhost:5000..."
python -m mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000 --host 0.0.0.0 &

# 2. Start FastAPI Backend
echo "[2/3] Starting FastAPI Backend on http://localhost:8000..."
python -m uvicorn backend.app.main:app --port 8000 --reload &

# 3. Start Frontend
echo "[3/3] Starting React Vite Frontend on http://localhost:5173..."
cd frontend && npm run dev &

echo "=========================================================="
echo "All NewsLens AI services running in background!"
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:8000"
echo "Swagger:   http://localhost:8000/docs"
echo "MLflow:    http://localhost:5000"
echo "=========================================================="
wait
