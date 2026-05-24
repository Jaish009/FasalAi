# scripts/seed_prices.py
# Seeds mock historical price data into the DB for development
# Run when Agmarknet API is not available
# Usage: python scripts/seed_prices.py

import sys
import os
import random
import logging
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("seed_prices")

# ── Realistic base prices (₹/quintal) with seasonality ──
CROP_CONFIGS = {
    "crop-wheat": {
        "base": 2100, "variance": 200,
        "seasonal": {1: 1.05, 2: 1.08, 3: 0.92, 4: 0.88, 5: 0.90, 6: 0.95,
                     7: 1.00, 8: 1.02, 9: 1.04, 10: 1.06, 11: 1.08, 12: 1.06},
    },
    "crop-soybean": {
        "base": 4200, "variance": 400,
        "seasonal": {1: 0.95, 2: 0.92, 3: 0.90, 4: 0.88, 5: 0.90, 6: 0.95,
                     7: 1.00, 8: 1.05, 9: 1.10, 10: 1.08, 11: 1.05, 12: 1.00},
    },
    "crop-onion": {
        "base": 1200, "variance": 600,
        "seasonal": {1: 1.20, 2: 1.10, 3: 0.80, 4: 0.70, 5: 0.75, 6: 1.00,
                     7: 1.30, 8: 1.40, 9: 1.35, 10: 1.20, 11: 1.10, 12: 1.25},
    },
    "crop-cotton": {
        "base": 6500, "variance": 500,
        "seasonal": {1: 0.95, 2: 0.93, 3: 0.90, 4: 0.88, 5: 0.90, 6: 0.92,
                     7: 0.95, 8: 0.98, 9: 1.00, 10: 1.05, 11: 1.08, 12: 1.02},
    },
    "crop-maize": {
        "base": 1850, "variance": 200,
        "seasonal": {1: 1.05, 2: 1.03, 3: 1.00, 4: 0.95, 5: 0.92, 6: 0.90,
                     7: 0.92, 8: 0.95, 9: 0.98, 10: 1.00, 11: 1.03, 12: 1.05},
    },
    "crop-paddy": {
        "base": 2000, "variance": 180,
        "seasonal": {1: 1.02, 2: 1.00, 3: 0.98, 4: 0.95, 5: 0.93, 6: 0.92,
                     7: 0.95, 8: 0.98, 9: 1.00, 10: 1.02, 11: 1.05, 12: 1.04},
    },
}

MANDI_IDS = [
    "mandi-indore", "mandi-ujjain", "mandi-dewas",
    "mandi-khargone", "mandi-bhopal"
]


def seed_prices(days: int = 400):
    """Seed mock price data for all crop-mandi pairs."""
    engine = create_engine(settings.DATABASE_URL)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)

    insert_query = text("""
        INSERT INTO price_records
            (id, crop_id, mandi_id, price, min_price, max_price, modal_price,
             arrival_qty, date, source, created_at)
        VALUES
            (gen_random_uuid(), :crop_id, :mandi_id, :price, :min_price,
             :max_price, :modal_price, :arrival_qty, :date, 'mock', NOW())
        ON CONFLICT (crop_id, mandi_id, date) DO NOTHING
    """)

    total = 0
    for crop_id, config in CROP_CONFIGS.items():
        for mandi_id in MANDI_IDS:
            logger.info(f"Seeding {crop_id} @ {mandi_id}...")
            records = []
            current_price = config["base"]

            current = start_date
            while current <= end_date:
                # Skip ~10% of days (mandi closed)
                if random.random() < 0.10:
                    current += timedelta(days=1)
                    continue

                month = current.month
                seasonal_factor = config["seasonal"].get(month, 1.0)

                # Random walk with seasonal adjustment
                drift = random.gauss(0, config["variance"] * 0.03)
                current_price = current_price * (1 + drift / current_price) * seasonal_factor
                current_price = max(config["base"] * 0.5, min(config["base"] * 2, current_price))

                modal = round(current_price, 2)
                spread = modal * random.uniform(0.02, 0.06)
                min_p = round(modal - spread, 2)
                max_p = round(modal + spread, 2)
                arrival = round(random.uniform(50, 800), 1)

                records.append({
                    "crop_id": crop_id,
                    "mandi_id": mandi_id,
                    "price": modal,
                    "min_price": min_p,
                    "max_price": max_p,
                    "modal_price": modal,
                    "arrival_qty": arrival,
                    "date": current,
                })

                current += timedelta(days=1)

            # Batch insert
            with engine.begin() as conn:
                conn.execute(insert_query, records)

            total += len(records)
            logger.info(f"  ✅ {len(records)} records inserted")

    logger.info(f"\n🌾 Done! {total} price records seeded into database.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=400, help="Days of history to generate")
    args = parser.parse_args()
    seed_prices(args.days)
