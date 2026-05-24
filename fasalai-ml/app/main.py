# app/main.py
# FasalAI ML Service — FastAPI Entry Point

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routers import predict, train, health
from app.services.model_store import ModelStore
from app.config import settings

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fasalai-ml")


# ── Lifespan: load models on startup ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🌾 FasalAI ML Service starting...")
    model_store = ModelStore()
    await model_store.load_all_models()
    app.state.model_store = model_store
    logger.info(f"✅ Loaded {len(model_store.models)} pre-trained models")
    yield
    logger.info("👋 FasalAI ML Service shutting down")


# ── App ──
app = FastAPI(
    title="FasalAI ML Service",
    description="Prophet-based price prediction microservice for Indian mandi crops",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.NEXTJS_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, prefix="/predict", tags=["Predictions"])
app.include_router(train.router, prefix="/train", tags=["Training"])


@app.get("/")
async def root():
    return {
        "service": "FasalAI ML Service",
        "version": "1.0.0",
        "status": "running",
        "description": "Prophet-based mandi price prediction for Indian farmers 🌾",
    }
