import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.core.logging import logger
from backend.app.core.database import init_db
from backend.app.ml.model_loader import ModelRegistry

# Import routes
from backend.app.api.routes import (
    health,
    prediction,
    model,
    metrics,
    monitoring,
    training,
    dataset,
    experiments,
    feedback
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Load Model Cache
    logger.info("Initializing SQLite database tables...")
    init_db()
    logger.info("Pre-loading machine learning model into memory...")
    ModelRegistry.get_instance()
    logger.info(f"NewsLens AI Backend running on port {settings.API_PORT}")
    yield
    # Shutdown
    logger.info("Shutting down NewsLens AI Backend...")

app = FastAPI(
    title="NewsLens AI API",
    description="Continuous Learning News Topic Classification System with MLOps, MLflow, and Evidently AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware for React Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(health.router, prefix=api_v1_prefix, tags=["Health"])
app.include_router(prediction.router, prefix=api_v1_prefix, tags=["Prediction"])
app.include_router(feedback.router, prefix=api_v1_prefix, tags=["Feedback"])
app.include_router(model.router, prefix=api_v1_prefix, tags=["Model"])
app.include_router(metrics.router, prefix=api_v1_prefix, tags=["Metrics"])
app.include_router(monitoring.router, prefix=api_v1_prefix, tags=["Monitoring"])
app.include_router(training.router, prefix=api_v1_prefix, tags=["Continuous Learning & Training"])
app.include_router(dataset.router, prefix=api_v1_prefix, tags=["Dataset & DVC"])
app.include_router(experiments.router, prefix=api_v1_prefix, tags=["MLflow Experiments & Registry"])

@app.get("/", summary="Root Endpoint")
def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": "/api/v1"
    }

# Global exception handler for uncaught exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred. Please try again later."}
    )
