# New Topics Classification System - Service Launcher for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " New Topics Classification System - Service Launcher      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start MLflow Server
Write-Host "[1/3] Starting MLflow Tracking Server on http://localhost:5000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\python -m mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000 --host 0.0.0.0"

# 2. Start FastAPI Backend
Write-Host "[2/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\python -m uvicorn backend.app.main:app --port 8000 --reload"

# 3. Start React Vite Frontend
Write-Host "[3/3] Starting React Liquid Glass Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "All New Topics Classification System services are online!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "Swagger:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "MLflow:    http://localhost:5000" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green

