# scripts/pretrain.py
# Run this once to pre-train all Prophet models before deploying
# Usage: python scripts/pretrain.py

import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.prophet_service import ProphetService
from app.services.database import DatabaseService
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("pretrain")


def pretrain_all():
    logger.info("🌾 FasalAI — Pre-training Prophet models")
    logger.info(f"Model directory: {settings.MODEL_DIR}")

    prophet_svc = ProphetService()
    db_svc = DatabaseService()

    # Get all crop-mandi pairs with enough data
    pairs = db_svc.get_all_crop_mandi_pairs()

    if not pairs:
        logger.warning("No crop-mandi pairs found with sufficient data.")
        logger.info("Make sure you have run: npm run db:seed AND synced Agmarknet data first.")
        return

    logger.info(f"Found {len(pairs)} crop-mandi pairs to train")

    trained = 0
    failed = 0
    total_start = time.time()

    for i, pair in enumerate(pairs, 1):
        crop_id = pair["crop_id"]
        mandi_id = pair["mandi_id"]
        crop_name = pair.get("crop_name", crop_id)
        mandi_name = pair.get("mandi_name", mandi_id)

        logger.info(f"[{i}/{len(pairs)}] Training: {crop_name} @ {mandi_name}")
        start = time.time()

        try:
            df = db_svc.get_price_history(crop_id, mandi_id, days=730)

            if df.empty or len(df) < settings.MIN_TRAINING_DAYS:
                logger.warning(f"  ⚠ Insufficient data ({len(df)} days) — skipping")
                failed += 1
                continue

            model, metrics = prophet_svc.train(df, crop_id, mandi_id)
            elapsed = time.time() - start

            mape = metrics.get("mape")
            mape_str = f"{mape:.3f}" if mape else "N/A"
            logger.info(f"  ✅ Done in {elapsed:.1f}s | MAPE: {mape_str} | Data: {len(df)} days")
            trained += 1

        except Exception as e:
            logger.error(f"  ❌ Failed: {e}")
            failed += 1

    total_elapsed = time.time() - total_start
    logger.info("─" * 50)
    logger.info(f"✅ Training complete!")
    logger.info(f"   Trained: {trained} models")
    logger.info(f"   Failed:  {failed} models")
    logger.info(f"   Time:    {total_elapsed:.1f}s")
    logger.info(f"   Saved to: {settings.MODEL_DIR}/")


if __name__ == "__main__":
    pretrain_all()
