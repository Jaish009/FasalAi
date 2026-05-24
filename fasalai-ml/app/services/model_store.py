# app/services/model_store.py
# In-memory store of loaded Prophet models — avoids reloading from disk on every request

import logging
import os
from typing import Dict, Optional
from prophet import Prophet
from app.services.prophet_service import ProphetService
from app.config import settings

logger = logging.getLogger(__name__)


class ModelStore:
    """
    Loads and caches Prophet models in memory.
    On startup: loads all pre-trained models from disk.
    On prediction: returns cached model or triggers training.
    """

    def __init__(self):
        self.models: Dict[str, Prophet] = {}   # key: "crop_id__mandi_id"
        self.prophet_svc = ProphetService()
        self.loaded_at: Dict[str, str] = {}

    async def load_all_models(self):
        """Load all saved models from disk into memory on startup."""
        model_dir = settings.MODEL_DIR
        os.makedirs(model_dir, exist_ok=True)

        if not os.path.exists(model_dir):
            logger.info("No saved models found — models will be trained on first request")
            return

        model_files = [f for f in os.listdir(model_dir) if f.endswith(".joblib")]
        loaded = 0

        for filename in model_files:
            key = filename.replace(".joblib", "")
            parts = key.split("__")
            if len(parts) != 2:
                continue

            crop_id, mandi_id = parts
            model = self.prophet_svc.load_model(crop_id, mandi_id)
            if model:
                self.models[key] = model
                self.loaded_at[key] = "startup"
                loaded += 1

        logger.info(f"Loaded {loaded}/{len(model_files)} models from disk")

    def get_model(self, crop_id: str, mandi_id: str) -> Optional[Prophet]:
        """Get a model from memory cache."""
        key = self.prophet_svc.get_model_key(crop_id, mandi_id)
        return self.models.get(key)

    def set_model(self, crop_id: str, mandi_id: str, model: Prophet):
        """Store a newly trained model in memory."""
        key = self.prophet_svc.get_model_key(crop_id, mandi_id)
        self.models[key] = model
        self.loaded_at[key] = "trained"
        logger.info(f"Cached model for {key}")

    def needs_retraining(self, crop_id: str, mandi_id: str) -> bool:
        """Check if model is stale and needs retraining."""
        age_hours = self.prophet_svc.get_model_age_hours(crop_id, mandi_id)
        return age_hours >= settings.RETRAIN_INTERVAL_HOURS

    def is_loaded(self, crop_id: str, mandi_id: str) -> bool:
        key = self.prophet_svc.get_model_key(crop_id, mandi_id)
        return key in self.models
