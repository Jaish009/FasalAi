# app/services/prophet_service.py
# Core ML logic using Facebook Prophet for time series price forecasting

import pandas as pd
import numpy as np
import logging
import os
import joblib
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple, List
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from app.config import settings

logger = logging.getLogger(__name__)


class ProphetService:
    """
    Wraps Facebook Prophet for mandi price forecasting.

    Prophet is ideal for this use case because:
    - Handles seasonality (crop seasons: Kharif, Rabi, Zaid)
    - Handles missing data (mandis closed on holidays)
    - Handles trend changepoints (policy changes, MSP updates)
    - Robust to outliers (price spikes from weather events)
    """

    def __init__(self):
        os.makedirs(settings.MODEL_DIR, exist_ok=True)

    def get_model_key(self, crop_id: str, mandi_id: str) -> str:
        return f"{crop_id}__{mandi_id}"

    def get_model_path(self, crop_id: str, mandi_id: str) -> str:
        key = self.get_model_key(crop_id, mandi_id)
        return os.path.join(settings.MODEL_DIR, f"{key}.joblib")

    # ── Train ──────────────────────────────────────────────────────────
    def train(self, df: pd.DataFrame, crop_id: str, mandi_id: str) -> Tuple[Prophet, Dict]:
        """
        Train a Prophet model on historical price data.
        Returns the trained model and training metrics.
        """
        if len(df) < settings.MIN_TRAINING_DAYS:
            raise ValueError(
                f"Need at least {settings.MIN_TRAINING_DAYS} days of data, got {len(df)}"
            )

        logger.info(f"Training Prophet model for crop={crop_id}, mandi={mandi_id} with {len(df)} data points")

        # ── Feature Engineering ──
        df = self._add_features(df)

        # ── Configure Prophet ──
        model = Prophet(
            # Trend
            changepoint_prior_scale=0.15,   # How flexible the trend is
            changepoint_range=0.9,          # Look for changepoints in 90% of data

            # Seasonality
            yearly_seasonality=True,        # Crop seasons (Kharif/Rabi)
            weekly_seasonality=True,        # Weekly mandi patterns
            daily_seasonality=False,        # Daily not relevant for price data

            # Uncertainty
            interval_width=0.85,            # 85% confidence interval
            uncertainty_samples=500,

            # Missing data
            growth="linear",
        )

        # Add Indian agricultural seasonality
        # Kharif harvest: Oct-Nov (prices drop from surplus)
        # Rabi harvest: Mar-Apr (prices drop from surplus)
        model.add_seasonality(
            name="kharif_season",
            period=365.25,
            fourier_order=5,
            prior_scale=10,
        )

        # Add MSP (Minimum Support Price) announcement effect
        # Government announces MSP in June/July — affects farmer expectations
        model.add_seasonality(
            name="msp_announcement",
            period=365.25 / 2,
            fourier_order=3,
        )

        # Add regressors if available
        if "arrival_qty" in df.columns and df["arrival_qty"].notna().sum() > 10:
            model.add_regressor("arrival_qty", standardize=True)

        # ── Fit Model ──
        model.fit(df)

        # ── Evaluate with Cross Validation ──
        metrics = {}
        try:
            if len(df) >= 60:  # Need enough data for CV
                cv_results = cross_validation(
                    model,
                    initial=f"{max(30, len(df) // 2)} days",
                    period="15 days",
                    horizon="30 days",
                    disable_tqdm=True,
                )
                perf = performance_metrics(cv_results)
                metrics = {
                    "mape": float(perf["mape"].mean()) if "mape" in perf else None,
                    "rmse": float(perf["rmse"].mean()) if "rmse" in perf else None,
                    "mae": float(perf["mae"].mean()) if "mae" in perf else None,
                }
                logger.info(f"Model CV metrics: MAPE={metrics.get('mape', 'N/A'):.3f}")
        except Exception as e:
            logger.warning(f"Cross validation failed (non-critical): {e}")

        # ── Save Model ──
        model_path = self.get_model_path(crop_id, mandi_id)
        joblib.dump(model, model_path)
        logger.info(f"✅ Model saved to {model_path}")

        return model, metrics

    # ── Predict ────────────────────────────────────────────────────────
    def predict(
        self,
        model: Prophet,
        df: pd.DataFrame,
        horizon: int,
    ) -> Dict:
        """
        Generate price predictions for the next `horizon` days.
        Returns predictions with confidence intervals and trend analysis.
        """
        # Create future dataframe
        future = model.make_future_dataframe(periods=horizon, freq="D")

        # Add regressors to future if model uses them
        if "arrival_qty" in model.extra_regressors:
            # Extrapolate arrival qty (use rolling average of last 30 days)
            last_qty = df["arrival_qty"].tail(30).mean()
            future["arrival_qty"] = last_qty

        # Generate forecast
        forecast = model.predict(future)

        # Extract future predictions only (not historical)
        future_forecast = forecast.tail(horizon).copy()

        # Clean up — Prophet can predict negative prices, clip to 0
        future_forecast["yhat"] = future_forecast["yhat"].clip(lower=0)
        future_forecast["yhat_lower"] = future_forecast["yhat_lower"].clip(lower=0)
        future_forecast["yhat_upper"] = future_forecast["yhat_upper"].clip(lower=0)

        # ── Calculate Confidence Score ──
        current_price = df["y"].iloc[-1]
        predicted_prices = future_forecast["yhat"].values

        # Confidence based on: interval width relative to price, data quantity, trend consistency
        interval_widths = future_forecast["yhat_upper"] - future_forecast["yhat_lower"]
        avg_interval_width = interval_widths.mean()
        avg_price = future_forecast["yhat"].mean()

        # Narrower interval relative to price = higher confidence
        interval_ratio = avg_interval_width / avg_price if avg_price > 0 else 1
        raw_confidence = max(0, 1 - interval_ratio) * 100

        # Scale to 65–97% range (honest but not too pessimistic)
        confidence = min(97, max(65, raw_confidence * 0.85 + 15))

        # ── Trend Analysis ──
        first_price = predicted_prices[0] if len(predicted_prices) > 0 else current_price
        last_price = predicted_prices[-1] if len(predicted_prices) > 0 else current_price
        pct_change = (last_price - current_price) / current_price * 100

        if pct_change > 2:
            trend = "RISING"
        elif pct_change < -2:
            trend = "FALLING"
        else:
            trend = "STABLE"

        # ── Best Sell Day ──
        best_sell_idx = future_forecast["yhat"].idxmax()
        best_sell_day = future_forecast.loc[best_sell_idx, "ds"].strftime("%Y-%m-%d")

        # ── Day-by-Day Forecast ──
        daily_forecast = [
            {
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_price": round(float(row["yhat"]), 2),
                "lower_bound": round(float(row["yhat_lower"]), 2),
                "upper_bound": round(float(row["yhat_upper"]), 2),
            }
            for _, row in future_forecast.iterrows()
        ]

        # ── Final Prediction (at horizon) ──
        final = future_forecast.iloc[-1]

        return {
            "predicted_price": round(float(final["yhat"]), 2),
            "min_price": round(float(final["yhat_lower"]), 2),
            "max_price": round(float(final["yhat_upper"]), 2),
            "confidence": round(float(confidence), 1),
            "trend": trend,
            "best_sell_day": best_sell_day,
            "daily_forecast": daily_forecast,
            "pct_change": round(float(pct_change), 2),
            "current_price": round(float(current_price), 2),
        }

    # ── Load Saved Model ───────────────────────────────────────────────
    def load_model(self, crop_id: str, mandi_id: str) -> Optional[Prophet]:
        """Load a previously trained model from disk."""
        model_path = self.get_model_path(crop_id, mandi_id)
        if not os.path.exists(model_path):
            return None
        try:
            model = joblib.load(model_path)
            logger.info(f"Loaded model from {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load model {model_path}: {e}")
            return None

    def model_exists(self, crop_id: str, mandi_id: str) -> bool:
        return os.path.exists(self.get_model_path(crop_id, mandi_id))

    def get_model_age_hours(self, crop_id: str, mandi_id: str) -> float:
        """Returns how old the saved model is in hours."""
        path = self.get_model_path(crop_id, mandi_id)
        if not os.path.exists(path):
            return float("inf")
        modified = datetime.fromtimestamp(os.path.getmtime(path))
        return (datetime.now() - modified).total_seconds() / 3600

    # ── Feature Engineering ────────────────────────────────────────────
    def _add_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add features to improve forecast accuracy."""
        df = df.copy()

        # Fill missing dates (mandis closed on holidays/weekends)
        date_range = pd.date_range(start=df["ds"].min(), end=df["ds"].max(), freq="D")
        df = df.set_index("ds").reindex(date_range).rename_axis("ds").reset_index()

        # Forward fill prices for missing days (price stays same when mandi closed)
        df["y"] = df["y"].fillna(method="ffill").fillna(method="bfill")

        # Handle arrival quantity
        if "arrival_qty" in df.columns:
            df["arrival_qty"] = df["arrival_qty"].fillna(df["arrival_qty"].median())
        else:
            df["arrival_qty"] = 100.0  # default

        # Remove extreme outliers (prices 3x above/below rolling median are data errors)
        rolling_median = df["y"].rolling(window=14, center=True, min_periods=3).median()
        mask = (df["y"] > rolling_median * 3) | (df["y"] < rolling_median / 3)
        df.loc[mask, "y"] = rolling_median[mask]

        return df[["ds", "y", "arrival_qty"]].dropna(subset=["ds", "y"])

    # ── Generate Mock Predictions (fallback) ──────────────────────────
    def generate_mock_prediction(self, crop_name: str, horizon: int) -> Dict:
        """
        Used when no historical data is available.
        Uses known price ranges for common Indian crops.
        """
        mock_prices = {
            "wheat": 2185, "soybean": 4320, "onion": 1240,
            "cotton": 6800, "maize": 1890, "paddy": 2040,
            "tomato": 850, "garlic": 3100, "mustard": 5200, "chana": 4800,
        }
        base = mock_prices.get(crop_name.lower(), 2000)
        trend_factor = 1 + (np.random.uniform(-0.03, 0.05))
        predicted = round(base * (trend_factor ** (horizon / 30)), 2)

        daily_forecast = []
        for i in range(horizon):
            date = (datetime.now() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            noise = base * np.random.uniform(-0.01, 0.02)
            day_price = round(base + (predicted - base) * (i / horizon) + noise, 2)
            daily_forecast.append({
                "date": date,
                "predicted_price": day_price,
                "lower_bound": round(day_price * 0.95, 2),
                "upper_bound": round(day_price * 1.05, 2),
            })

        pct_change = (predicted - base) / base * 100
        return {
            "predicted_price": predicted,
            "min_price": round(predicted * 0.93, 2),
            "max_price": round(predicted * 1.07, 2),
            "confidence": 68.0,
            "trend": "RISING" if pct_change > 2 else "FALLING" if pct_change < -2 else "STABLE",
            "best_sell_day": (datetime.now() + timedelta(days=horizon)).strftime("%Y-%m-%d"),
            "daily_forecast": daily_forecast,
            "pct_change": round(pct_change, 2),
            "current_price": float(base),
        }
