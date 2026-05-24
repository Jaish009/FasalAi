# app/services/forecast_service.py
# Core ML logic using Scikit-Learn for time series price forecasting

import pandas as pd
import numpy as np
import logging
import os
import joblib
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple, List
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_percentage_error, mean_absolute_error, root_mean_squared_error
from app.config import settings

logger = logging.getLogger(__name__)


class ForecastService:
    """
    Wraps Scikit-Learn for mandi price forecasting.
    Replaces Prophet for better stability and lower resource usage.
    """

    def __init__(self):
        os.makedirs(settings.MODEL_DIR, exist_ok=True)

    def get_model_key(self, crop_id: str, mandi_id: str) -> str:
        return f"{crop_id}__{mandi_id}"

    def get_model_path(self, crop_id: str, mandi_id: str) -> str:
        key = self.get_model_key(crop_id, mandi_id)
        return os.path.join(settings.MODEL_DIR, f"{key}.joblib")

    # ── Train ──────────────────────────────────────────────────────────
    def train(self, df: pd.DataFrame, crop_id: str, mandi_id: str) -> Tuple[RandomForestRegressor, Dict]:
        """
        Train a RandomForest model on historical price data.
        Returns the trained model and training metrics.
        """
        if len(df) < settings.MIN_TRAINING_DAYS:
            raise ValueError(
                f"Need at least {settings.MIN_TRAINING_DAYS} days of data, got {len(df)}"
            )

        logger.info(f"Training Forecast model for crop={crop_id}, mandi={mandi_id} with {len(df)} data points")

        # ── Feature Engineering ──
        df = self._add_features(df)
        
        # Prepare X and y
        features = ["day_of_year", "month", "day_of_week", "trend_idx"]
        if "arrival_qty" in df.columns and df["arrival_qty"].notna().sum() > 10:
            features.append("arrival_qty")
            
        X = df[features]
        y = df["y"]

        # ── Configure Model ──
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )

        # ── Fit Model ──
        model.fit(X, y)

        # ── Evaluate with Cross Validation ──
        metrics = {}
        try:
            if len(df) >= 60:
                tscv = TimeSeriesSplit(n_splits=3)
                mapes, mses, maes = [], [], []
                
                for train_index, test_index in tscv.split(X):
                    X_tr, X_te = X.iloc[train_index], X.iloc[test_index]
                    y_tr, y_te = y.iloc[train_index], y.iloc[test_index]
                    
                    cv_model = RandomForestRegressor(n_estimators=50, random_state=42)
                    cv_model.fit(X_tr, y_tr)
                    preds = cv_model.predict(X_te)
                    
                    mapes.append(mean_absolute_percentage_error(y_te, preds))
                    mses.append(root_mean_squared_error(y_te, preds))
                    maes.append(mean_absolute_error(y_te, preds))
                
                metrics = {
                    "mape": float(np.mean(mapes)),
                    "rmse": float(np.mean(mses)),
                    "mae": float(np.mean(maes)),
                }
                logger.info(f"Model CV metrics: MAPE={metrics.get('mape', 'N/A'):.3f}")
        except Exception as e:
            logger.warning(f"Cross validation failed (non-critical): {e}")

        # ── Save Model ──
        model_path = self.get_model_path(crop_id, mandi_id)
        joblib.dump(model, model_path)
        logger.info(f"✅ Model saved to {model_path}")

        # Save the last date index so we know where to start predictions
        model.last_date = df["ds"].max()
        model.last_trend_idx = df["trend_idx"].max()
        model.features = features

        return model, metrics

    # ── Predict ────────────────────────────────────────────────────────
    def predict(
        self,
        model: RandomForestRegressor,
        df: pd.DataFrame,
        horizon: int,
    ) -> Dict:
        """
        Generate price predictions for the next `horizon` days.
        Returns predictions with confidence intervals and trend analysis.
        """
        # Ensure df has the necessary features
        df = self._add_features(df)
        
        # Create future dataframe
        last_date = df["ds"].max()
        future_dates = pd.date_range(start=last_date + timedelta(days=1), periods=horizon, freq="D")
        
        future = pd.DataFrame({"ds": future_dates})
        
        # Calculate base trend index to continue where we left off
        last_trend_idx = len(df)
        
        future["day_of_year"] = future["ds"].dt.dayofyear
        future["month"] = future["ds"].dt.month
        future["day_of_week"] = future["ds"].dt.dayofweek
        future["trend_idx"] = range(last_trend_idx + 1, last_trend_idx + 1 + horizon)

        features = getattr(model, "features", ["day_of_year", "month", "day_of_week", "trend_idx"])

        if "arrival_qty" in features:
            last_qty = df["arrival_qty"].tail(30).mean()
            future["arrival_qty"] = last_qty

        X_future = future[features]
        
        # Generate forecast
        predicted_prices = model.predict(X_future)
        future["yhat"] = predicted_prices
        
        # Simulate uncertainty bounds (Random Forest doesn't give true predictive intervals easily natively without quantile regression)
        # We will estimate a 10% variance bound
        std_dev_estimate = predicted_prices * 0.08
        future["yhat_lower"] = (predicted_prices - std_dev_estimate).clip(min=0)
        future["yhat_upper"] = predicted_prices + std_dev_estimate

        # Clean up bounds
        future["yhat"] = future["yhat"].clip(lower=0)

        # ── Calculate Confidence Score ──
        current_price = df["y"].iloc[-1]
        
        # Simple confidence logic based on historical volatility 
        confidence = min(95.0, max(70.0, 95.0 - (std_dev_estimate.mean() / current_price) * 100))

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
        best_sell_idx = future["yhat"].idxmax()
        best_sell_day = future.loc[best_sell_idx, "ds"].strftime("%Y-%m-%d")

        # ── Day-by-Day Forecast ──
        daily_forecast = [
            {
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_price": round(float(row["yhat"]), 2),
                "lower_bound": round(float(row["yhat_lower"]), 2),
                "upper_bound": round(float(row["yhat_upper"]), 2),
            }
            for _, row in future.iterrows()
        ]

        # ── Final Prediction (at horizon) ──
        final = future.iloc[-1]

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
    def load_model(self, crop_id: str, mandi_id: str) -> Optional[RandomForestRegressor]:
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

        # Forward fill prices for missing days
        df["y"] = df["y"].ffill().bfill()

        # Extract time features
        df["day_of_year"] = df["ds"].dt.dayofyear
        df["month"] = df["ds"].dt.month
        df["day_of_week"] = df["ds"].dt.dayofweek
        
        # Linear trend index
        df["trend_idx"] = range(1, len(df) + 1)

        # Handle arrival quantity
        if "arrival_qty" in df.columns:
            df["arrival_qty"] = df["arrival_qty"].fillna(df["arrival_qty"].median())
        else:
            df["arrival_qty"] = 100.0  # default

        # Remove extreme outliers (prices 3x above/below rolling median are data errors)
        rolling_median = df["y"].rolling(window=14, center=True, min_periods=3).median()
        mask = (df["y"] > rolling_median * 3) | (df["y"] < rolling_median / 3)
        df.loc[mask, "y"] = rolling_median[mask]

        return df[["ds", "y", "arrival_qty", "day_of_year", "month", "day_of_week", "trend_idx"]].dropna(subset=["ds", "y"])

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
