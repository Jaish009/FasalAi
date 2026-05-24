# app/models/schemas.py
# Pydantic schemas for request & response validation

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Trend(str, Enum):
    RISING = "RISING"
    FALLING = "FALLING"
    STABLE = "STABLE"


# ── Prediction Request ──
class PredictRequest(BaseModel):
    crop_id: str = Field(..., description="Crop ID from database")
    mandi_id: str = Field(..., description="Mandi ID from database")
    horizon: int = Field(7, ge=1, le=90, description="Days ahead to predict (1–90)")

    class Config:
        json_schema_extra = {
            "example": {
                "crop_id": "crop-wheat",
                "mandi_id": "mandi-indore",
                "horizon": 7,
            }
        }


# ── Single Day Prediction ──
class DayPrediction(BaseModel):
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float


# ── Prediction Response ──
class PredictResponse(BaseModel):
    crop_id: str
    mandi_id: str
    crop_name: str
    mandi_name: str
    current_price: float
    predicted_price: float       # Modal prediction at horizon
    min_price: float             # Lower confidence bound
    max_price: float             # Upper confidence bound
    confidence: float            # 0–100 score
    trend: Trend
    horizon: int
    target_date: str
    daily_forecast: List[DayPrediction]  # Day-by-day breakdown
    best_sell_day: str           # Day with highest predicted price
    model_version: str = "prophet-v1"
    trained_on_days: int         # How many days of data model was trained on


# ── Train Request ──
class TrainRequest(BaseModel):
    crop_id: Optional[str] = None    # None = train all crops
    mandi_id: Optional[str] = None   # None = train all mandis
    force_retrain: bool = False


# ── Train Response ──
class TrainResponse(BaseModel):
    status: str
    models_trained: int
    failed: int
    message: str
    training_time_seconds: float


# ── Health Response ──
class HealthResponse(BaseModel):
    status: str
    models_loaded: int
    uptime_seconds: float
    last_training: Optional[str]
    version: str = "1.0.0"


# ── Price Data Point (used internally) ──
class PricePoint(BaseModel):
    date: datetime
    price: float
    mandi_id: str
    crop_id: str
