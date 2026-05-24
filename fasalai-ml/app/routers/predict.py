# app/routers/predict.py
# POST /predict — Main prediction endpoint called by Next.js

import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta

from app.models.schemas import PredictRequest, PredictResponse, DayPrediction
from app.services.forecast_service import ForecastService
from app.services.database import DatabaseService
from app.services.auth import verify_token
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

forecast_svc = ForecastService()
db_svc = DatabaseService()


@router.post("/", response_model=PredictResponse, dependencies=[Depends(verify_token)])
async def predict_price(request: Request, body: PredictRequest):
    """
    Predict future mandi price for a crop.

    Flow:
    1. Check if trained model exists in memory cache
    2. If not → fetch historical data from DB → train model → cache
    3. Run prediction for requested horizon
    4. Return prediction with confidence interval and trend
    """
    crop_id = body.crop_id
    mandi_id = body.mandi_id
    horizon = body.horizon

    # ── Get model store from app state ──
    model_store = request.app.state.model_store

    # ── Fetch crop & mandi info ──
    crop_info = db_svc.get_crop_info(crop_id)
    mandi_info = db_svc.get_mandi_info(mandi_id)

    crop_name = crop_info["name"] if crop_info else crop_id
    mandi_name = mandi_info["name"] if mandi_info else mandi_id

    # ── Get or train model ──
    model = model_store.get_model(crop_id, mandi_id)
    needs_retrain = model_store.needs_retraining(crop_id, mandi_id)

    if model is None or needs_retrain:
        logger.info(f"Training new model for {crop_name} @ {mandi_name}...")

        # Fetch historical price data
        df = db_svc.get_price_history(crop_id, mandi_id, days=730)  # 2 years

        if df.empty or len(df) < settings.MIN_TRAINING_DAYS:
            logger.warning(f"No model/data for {crop_id}/{mandi_id}. Using mock fallback.")
            result = forecast_svc.generate_mock_prediction(crop_name, horizon)
        else:
            try:
                model, metrics = forecast_svc.train(df, crop_id, mandi_id)
                model_store.set_model(crop_id, mandi_id, model)
                logger.info(f"✅ Model trained: {metrics}")
                result = forecast_svc.predict(model, df, horizon)
            except Exception as e:
                logger.error(f"Training failed for {crop_id}/{mandi_id}: {e}")
                raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")
    else:
        # Fetch recent data for prediction context
        df = db_svc.get_price_history(crop_id, mandi_id, days=90)

        # ── Run prediction ──
        try:
            result = forecast_svc.predict(model, df, horizon)
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # ── Save prediction to DB ──
    target_date = (datetime.now() + timedelta(days=horizon)).strftime("%Y-%m-%d")
    db_svc.save_prediction({
        "crop_id": crop_id,
        "mandi_id": mandi_id,
        "predicted_price": result["predicted_price"],
        "min_price": result["min_price"],
        "max_price": result["max_price"],
        "target_date": target_date,
        "horizon": horizon,
        "confidence": result["confidence"],
        "trend": result["trend"],
        "model_version": "sklearn-v1",
    })

    return PredictResponse(
        crop_id=crop_id,
        mandi_id=mandi_id,
        crop_name=crop_name,
        mandi_name=mandi_name,
        current_price=result["current_price"],
        predicted_price=result["predicted_price"],
        min_price=result["min_price"],
        max_price=result["max_price"],
        confidence=result["confidence"],
        trend=result["trend"],
        horizon=horizon,
        target_date=target_date,
        daily_forecast=[DayPrediction(**d) for d in result["daily_forecast"]],
        best_sell_day=result["best_sell_day"],
        model_version="sklearn-v1",
        trained_on_days=len(df) if 'df' in locals() and not df.empty else 0,
    )


@router.post("/batch", dependencies=[Depends(verify_token)])
async def predict_batch(request: Request, requests_list: list[PredictRequest]):
    """
    Predict prices for multiple crop-mandi pairs at once.
    Used for pre-populating the dashboard on login.
    """
    if len(requests_list) > 20:
        raise HTTPException(status_code=400, detail="Max 20 predictions per batch request")

    results = []
    for req in requests_list:
        try:
            result = await predict_price(request, req)
            results.append({"status": "success", "data": result})
        except Exception as e:
            results.append({
                "status": "error",
                "crop_id": req.crop_id,
                "mandi_id": req.mandi_id,
                "error": str(e),
            })

    return {"results": results, "total": len(results)}
