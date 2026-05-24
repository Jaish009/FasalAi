# app/routers/train.py
# POST /train — Trigger model training for all or specific crop-mandi pairs

import logging
import time
from fastapi import APIRouter, Depends, Request, BackgroundTasks
from app.models.schemas import TrainRequest, TrainResponse
from app.services.prophet_service import ProphetService
from app.services.database import DatabaseService
from app.services.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter()

prophet_svc = ProphetService()
db_svc = DatabaseService()


@router.post("/", response_model=TrainResponse, dependencies=[Depends(verify_token)])
async def trigger_training(
    body: TrainRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Trigger model training.
    - If crop_id + mandi_id given → train only that pair
    - If none given → train all pairs with sufficient data

    Training runs in background so API responds immediately.
    """
    model_store = request.app.state.model_store
    start = time.time()

    if body.crop_id and body.mandi_id:
        # Train specific pair
        pairs = [{"crop_id": body.crop_id, "mandi_id": body.mandi_id,
                  "crop_name": body.crop_id, "mandi_name": body.mandi_id}]
    else:
        # Train all pairs from DB
        pairs = db_svc.get_all_crop_mandi_pairs()

    if not pairs:
        return TrainResponse(
            status="skipped",
            models_trained=0,
            failed=0,
            message="No crop-mandi pairs with sufficient data found",
            training_time_seconds=0,
        )

    # Run in background
    background_tasks.add_task(
        _train_all, pairs, model_store, body.force_retrain
    )

    elapsed = time.time() - start
    return TrainResponse(
        status="started",
        models_trained=0,
        failed=0,
        message=f"Training started for {len(pairs)} crop-mandi pairs in background",
        training_time_seconds=elapsed,
    )


async def _train_all(pairs: list, model_store, force: bool):
    """Background task: trains all crop-mandi pairs sequentially."""
    trained = 0
    failed = 0

    for pair in pairs:
        crop_id = pair["crop_id"]
        mandi_id = pair["mandi_id"]

        # Skip if model is fresh and not forcing retrain
        if not force and not model_store.needs_retraining(crop_id, mandi_id):
            logger.info(f"Skipping {crop_id}/{mandi_id} — model is fresh")
            continue

        try:
            df = db_svc.get_price_history(crop_id, mandi_id, days=730)
            if df.empty:
                logger.warning(f"No data for {crop_id}/{mandi_id} — skipping")
                failed += 1
                continue

            model, metrics = prophet_svc.train(df, crop_id, mandi_id)
            model_store.set_model(crop_id, mandi_id, model)
            trained += 1
            logger.info(f"✅ Trained {pair.get('crop_name', crop_id)} @ {pair.get('mandi_name', mandi_id)}")
        except Exception as e:
            logger.error(f"❌ Failed {crop_id}/{mandi_id}: {e}")
            failed += 1

    logger.info(f"Training complete: {trained} trained, {failed} failed")


@router.get("/status", dependencies=[Depends(verify_token)])
async def training_status(request: Request):
    """Return status of all loaded models."""
    model_store = request.app.state.model_store
    models_info = []

    for key in model_store.models:
        crop_id, mandi_id = key.split("__")
        age_hours = prophet_svc.get_model_age_hours(crop_id, mandi_id)
        models_info.append({
            "key": key,
            "crop_id": crop_id,
            "mandi_id": mandi_id,
            "age_hours": round(age_hours, 1),
            "needs_retraining": age_hours >= 24,
        })

    return {
        "total_models": len(model_store.models),
        "models": models_info,
    }
