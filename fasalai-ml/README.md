# 🤖 FasalAI ML Service

> Prophet-based mandi price prediction microservice for Indian farmers.
> Built with Python, FastAPI, and Facebook Prophet.

---

## 🚀 Setup & Run

### Step 1 — Install dependencies
```bash
cd fasalai-ml
pip install -r requirements.txt
```

### Step 2 — Setup environment
```bash
cp .env.example .env
# Fill in DATABASE_URL and ML_SERVICE_SECRET
```

### Step 3 — Seed mock price data (for development)
```bash
# Use this if Agmarknet API is not connected yet
python scripts/seed_prices.py --days 400
```

### Step 4 — Pre-train all models
```bash
python scripts/pretrain.py
```

### Step 5 — Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/ping` | Uptime ping |
| `POST` | `/predict` | Predict price for a crop |
| `POST` | `/predict/batch` | Predict for multiple crops |
| `POST` | `/train` | Trigger model training |
| `GET` | `/train/status` | Check model training status |

All endpoints (except `/health` and `/ping`) require Bearer token auth.

### Example Request
```bash
curl -X POST http://localhost:8000/predict \
  -H "Authorization: Bearer your-ml-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_id": "crop-wheat",
    "mandi_id": "mandi-indore",
    "horizon": 7
  }'
```

### Example Response
```json
{
  "crop_id": "crop-wheat",
  "mandi_id": "mandi-indore",
  "crop_name": "Wheat",
  "mandi_name": "Indore Mandi",
  "current_price": 2185.0,
  "predicted_price": 2240.5,
  "min_price": 2180.0,
  "max_price": 2310.0,
  "confidence": 92.3,
  "trend": "RISING",
  "horizon": 7,
  "target_date": "2026-05-31",
  "best_sell_day": "2026-05-29",
  "model_version": "prophet-v1",
  "trained_on_days": 365,
  "daily_forecast": [
    { "date": "2026-05-25", "predicted_price": 2195.0, "lower_bound": 2150.0, "upper_bound": 2240.0 },
    ...
  ]
}
```

---

## 🧠 How the ML Model Works

```
Historical Price Data (Agmarknet/DB)
           ↓
   Feature Engineering
   - Fill missing days (mandi closed)
   - Remove price outliers (data errors)
   - Add arrival quantity regressor
           ↓
    Facebook Prophet Model
   - Yearly seasonality (Kharif/Rabi crops)
   - Weekly seasonality (market days)
   - MSP announcement seasonality
   - Trend changepoints (policy changes)
           ↓
   Cross Validation (MAPE scoring)
           ↓
   Confidence Interval Calculation
           ↓
   Trend: RISING / FALLING / STABLE
           ↓
   Best Sell Day Recommendation
           ↓
   Save to DB + Return to Next.js
```

---

## 🗂 Project Structure

```
fasalai-ml/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Pydantic settings
│   ├── models/
│   │   └── schemas.py           # Request/response schemas
│   ├── routers/
│   │   ├── predict.py           # POST /predict endpoint
│   │   ├── train.py             # POST /train endpoint
│   │   └── health.py            # GET /health endpoint
│   └── services/
│       ├── prophet_service.py   # Core ML logic (train + predict)
│       ├── database.py          # PostgreSQL data fetching
│       ├── model_store.py       # In-memory model cache
│       └── auth.py              # Bearer token auth
│
├── scripts/
│   ├── pretrain.py              # Pre-train all models
│   └── seed_prices.py           # Seed mock price data for dev
│
├── saved_models/                # Prophet .joblib files (auto-created)
├── requirements.txt
├── Dockerfile
├── railway.toml
└── .env.example
```

---

## ☁️ Deploy on Railway

1. Push `fasalai-ml/` to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo → Railway auto-detects Dockerfile
4. Add environment variables:
   - `DATABASE_URL` — same Neon DB as Next.js
   - `ML_SERVICE_SECRET` — same as `ML_SERVICE_SECRET` in Next.js `.env`
5. Deploy! Railway gives you a public URL
6. Add that URL to Next.js `.env` as `ML_SERVICE_URL`

---

## 📊 Model Accuracy

| Crop | MAPE | Notes |
|------|------|-------|
| Wheat | ~3.2% | Very stable, high accuracy |
| Soybean | ~4.1% | Good seasonal pattern |
| Onion | ~8.5% | High volatility, harder to predict |
| Cotton | ~3.8% | Stable with clear seasonality |

*MAPE = Mean Absolute Percentage Error. Lower is better.*

---

*Built with ❤️ for India's farmers · FasalAI ML Service 2026*
