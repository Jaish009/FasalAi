# app/services/database.py
# Connects to the same Neon PostgreSQL used by Next.js
# Fetches historical price data for model training

import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy import create_engine, text
from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseService:
    def __init__(self):
        self.engine = create_engine(
            settings.DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
        )

    def get_price_history(
        self,
        crop_id: str,
        mandi_id: str,
        days: int = 365,
    ) -> pd.DataFrame:
        """
        Fetch price history for a crop-mandi pair.
        Returns a DataFrame with columns: ds (date), y (price)
        Prophet requires exactly these column names.
        """
        since = datetime.now() - timedelta(days=days)

        query = text("""
            SELECT
                DATE(date) as ds,
                AVG(modal_price) as y,
                AVG(min_price) as min_price,
                AVG(max_price) as max_price,
                SUM(arrival_qty) as total_arrival
            FROM price_records
            WHERE
                crop_id = :crop_id
                AND mandi_id = :mandi_id
                AND date >= :since
                AND modal_price IS NOT NULL
                AND modal_price > 0
            GROUP BY DATE(date)
            ORDER BY ds ASC
        """)

        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {
                    "crop_id": crop_id,
                    "mandi_id": mandi_id,
                    "since": since,
                })
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

            if df.empty:
                logger.warning(f"No price data for crop={crop_id}, mandi={mandi_id}")
                return pd.DataFrame()

            df["ds"] = pd.to_datetime(df["ds"])
            df["y"] = df["y"].astype(float)
            df = df.dropna(subset=["ds", "y"])
            df = df[df["y"] > 0]

            logger.info(f"Fetched {len(df)} days of price data for crop={crop_id}, mandi={mandi_id}")
            return df

        except Exception as e:
            logger.error(f"Database error fetching prices: {e}")
            return pd.DataFrame()

    def get_latest_price(self, crop_id: str, mandi_id: str) -> Optional[float]:
        """Get the most recent price for a crop-mandi pair."""
        query = text("""
            SELECT modal_price
            FROM price_records
            WHERE crop_id = :crop_id AND mandi_id = :mandi_id
            ORDER BY date DESC
            LIMIT 1
        """)
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"crop_id": crop_id, "mandi_id": mandi_id})
                row = result.fetchone()
                return float(row[0]) if row else None
        except Exception as e:
            logger.error(f"Error fetching latest price: {e}")
            return None

    def get_all_crop_mandi_pairs(self) -> List[Dict]:
        """Get all unique crop-mandi combinations that have price data."""
        query = text("""
            SELECT DISTINCT
                pr.crop_id,
                pr.mandi_id,
                c.name as crop_name,
                c.name_hindi as crop_name_hindi,
                m.name as mandi_name,
                COUNT(*) as record_count
            FROM price_records pr
            JOIN crops c ON c.id = pr.crop_id
            JOIN mandis m ON m.id = pr.mandi_id
            GROUP BY pr.crop_id, pr.mandi_id, c.name, c.name_hindi, m.name
            HAVING COUNT(*) >= :min_records
            ORDER BY record_count DESC
        """)
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"min_records": settings.MIN_TRAINING_DAYS})
                return [dict(row._mapping) for row in result.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching crop-mandi pairs: {e}")
            return []

    def get_crop_info(self, crop_id: str) -> Optional[Dict]:
        """Get crop name and details."""
        query = text("SELECT id, name, name_hindi FROM crops WHERE id = :id")
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"id": crop_id})
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Error fetching crop info: {e}")
            return None

    def get_mandi_info(self, mandi_id: str) -> Optional[Dict]:
        """Get mandi name and details."""
        query = text("SELECT id, name, name_hindi, state, district FROM mandis WHERE id = :id")
        try:
            with self.engine.connect() as conn:
                result = conn.execute(query, {"id": mandi_id})
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Error fetching mandi info: {e}")
            return None

    def save_prediction(self, prediction: Dict) -> bool:
        """Save a prediction result back to the database."""
        query = text("""
            INSERT INTO price_predictions
                (id, crop_id, mandi_id, predicted_price, min_price, max_price,
                 target_date, horizon, confidence, trend, model_version, created_at)
            VALUES
                (gen_random_uuid(), :crop_id, :mandi_id, :predicted_price,
                 :min_price, :max_price, :target_date, :horizon,
                 :confidence, :trend, :model_version, NOW())
            ON CONFLICT (crop_id, mandi_id, target_date, horizon)
            DO UPDATE SET
                predicted_price = EXCLUDED.predicted_price,
                min_price = EXCLUDED.min_price,
                max_price = EXCLUDED.max_price,
                confidence = EXCLUDED.confidence,
                trend = EXCLUDED.trend,
                model_version = EXCLUDED.model_version,
                created_at = NOW()
        """)
        try:
            with self.engine.begin() as conn:
                conn.execute(query, prediction)
            return True
        except Exception as e:
            logger.error(f"Error saving prediction: {e}")
            return False
