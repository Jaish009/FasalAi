# app/routers/health.py
import time
import logging
from fastapi import APIRouter, Request
from app.models.schemas import HealthResponse

logger = logging.getLogger(__name__)
router = APIRouter()

START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request):
    """Public health check — used by Railway/Render for uptime monitoring."""
    model_store = getattr(request.app.state, "model_store", None)
    models_loaded = len(model_store.models) if model_store else 0

    return HealthResponse(
        status="healthy",
        models_loaded=models_loaded,
        uptime_seconds=round(time.time() - START_TIME, 1),
        last_training=None,
        version="1.0.0",
    )


@router.get("/ping")
async def ping():
    """Simple ping — for load balancer checks."""
    return {"pong": True}
