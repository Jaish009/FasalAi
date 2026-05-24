# 🌾 FasalAI — Complete Local Setup Guide

> Follow this guide step by step to run FasalAI on your computer.
> Estimated time: **30–45 minutes**

---

## 📋 Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Check Command | Download |
|------|---------|---------------|----------|
| Node.js | v20+ | `node --version` | [nodejs.org](https://nodejs.org) |
| Python | v3.11+ | `python --version` | [python.org](https://python.org) |
| Git | Any | `git --version` | [git-scm.com](https://git-scm.com) |
| VS Code | Any | — | [code.visualstudio.com](https://code.visualstudio.com) |

---

## 🗂 Step 1 — Extract the Project Files

You have 2 zip files downloaded:
- `fasalai-complete.zip` → Next.js app
- `fasalai-ml-service.zip` → Python ML service

```
Extract both to a folder like:
C:/Projects/fasalai/           (Windows)
~/Projects/fasalai/            (Mac/Linux)

Your folder structure should look like:
fasalai/
├── fasalai/          ← Next.js app (from fasalai-complete.zip)
└── fasalai-ml/       ← Python ML (from fasalai-ml-service.zip)
```

Open this folder in VS Code.

---

## 🔑 Step 2 — Collect All API Keys

You need accounts on these services. All have **free tiers**.

---

### 2A — Neon (PostgreSQL Database)
**Free forever, no credit card needed**

1. Go to [neon.tech](https://neon.tech) → Sign up
2. Click **"New Project"**
3. Name it `fasalai`, choose region **Asia Pacific (Singapore)**
4. Click **Create Project**
5. Copy the connection string — looks like:
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/fasalai?sslmode=require
   ```
6. Save it as `DATABASE_URL`

---

### 2B — Clerk (Authentication)
**Free for up to 10,000 users**

1. Go to [clerk.com](https://clerk.com) → Sign up
2. Click **"Add Application"**
3. Name: `FasalAI`, choose **Email + Phone** sign-in
4. Click **Create Application**
5. Go to **API Keys** in sidebar
6. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → starts with `pk_test_`
   - `CLERK_SECRET_KEY` → starts with `sk_test_`

---

### 2C — Resend (Email Notifications)
**Free for 3,000 emails/month**

1. Go to [resend.com](https://resend.com) → Sign up
2. Click **"Add API Key"**
3. Name: `fasalai-alerts`
4. Copy the key → starts with `re_`
5. Save as `RESEND_API_KEY`

> 💡 For development, use `onboarding@resend.dev` as the FROM email
> — no domain verification needed for testing!

---

### 2D — Twilio (SMS & WhatsApp)
**Free trial gives $15 credit**

1. Go to [twilio.com](https://twilio.com) → Sign up
2. Verify your phone number
3. Go to **Console Dashboard**
4. Copy:
   - `TWILIO_ACCOUNT_SID` → starts with `AC`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` → your free Twilio number (e.g. `+1415...`)
5. For WhatsApp: Go to **Messaging → Try it out → Send a WhatsApp message**
   - Follow the sandbox setup
   - Save sandbox number as `TWILIO_WHATSAPP_NUMBER`

---

### 2E — OpenWeatherMap (Weather Data)
**Free for 1,000 calls/day**

1. Go to [openweathermap.org](https://openweathermap.org/api) → Sign up
2. Go to **API Keys** tab
3. Copy the default key
4. Save as `OPENWEATHER_API_KEY`

> ⚠️ New keys take ~2 hours to activate. This is fine — weather is optional for now.

---

### 2F — Agmarknet (Government Mandi Data)
**Free — Government of India API**

1. Go to [data.gov.in](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi) → Register
2. Click **"Get API Key"**
3. Copy the key
4. Save as `AGMARKNET_API_KEY`

> 💡 **Development Tip:** If Agmarknet API takes time, skip it for now.
> We have a Python script that generates realistic mock price data!

---

## ⚙️ Step 3 — Setup the Next.js App

Open a terminal in the `fasalai/` folder (the Next.js app).

### 3A — Create environment file
```bash
cp .env.example .env.local
```

Open `.env.local` in VS Code and fill in your keys:

```env
# Paste your Neon connection string here
DATABASE_URL="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/fasalai?sslmode=require"

# Paste your Clerk keys here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Paste your Resend key here
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Paste your Twilio keys here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Paste your OpenWeather key here
OPENWEATHER_API_KEY=xxxxxxxxxxxx

# Paste your Agmarknet key here (or leave blank for now)
AGMARKNET_API_KEY=xxxxxxxxxxxx

# ML Service (fill after Step 5 is running)
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_SECRET=fasalai-dev-secret-123

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3B — Install Node.js dependencies
```bash
npm install
```
> This takes 2–3 minutes. You'll see packages downloading.

---

### 3C — Setup the database
```bash
# Push schema to Neon (creates all tables)
npx prisma migrate dev --name init

# Seed initial crops and mandis data
npm run db:seed
```

You should see:
```
✅ 10 crops seeded
✅ 5 mandis seeded
🌾 FasalAI database seeded successfully!
```

---

### 3D — Start the Next.js development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the FasalAI landing page! 🎉

---

## 🐍 Step 4 — Setup the Python ML Service

Open a **new terminal** (keep the Next.js one running) in the `fasalai-ml/` folder.

### 4A — Create a virtual environment
```bash
# Mac/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

You'll see `(venv)` at the start of your terminal line. ✅

### 4B — Install Python dependencies
```bash
pip install -r requirements.txt
```
> This takes 3–5 minutes (Prophet is a heavy library).

### 4C — Create environment file
```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/fasalai?sslmode=require
ML_SERVICE_SECRET=fasalai-dev-secret-123
AGMARKNET_API_KEY=xxxxxxxxxxxx
PORT=8000
ENV=development
MODEL_DIR=./saved_models
```

> ⚠️ `ML_SERVICE_SECRET` must be the **exact same value** as in your Next.js `.env.local`!

---

### 4D — Seed mock price data
Since Agmarknet API needs approval, use the mock seeder:
```bash
python scripts/seed_prices.py --days 400
```

You'll see:
```
Seeding crop-wheat @ mandi-indore...
  ✅ 360 records inserted
Seeding crop-soybean @ mandi-indore...
  ✅ 358 records inserted
...
🌾 Done! 17,800 price records seeded into database.
```

---

### 4E — Pre-train all Prophet models
```bash
python scripts/pretrain.py
```

This trains one model per crop-mandi pair. Takes ~2–5 minutes.
```
[1/25] Training: Wheat @ Indore Mandi
  ✅ Done in 8.3s | MAPE: 0.032 | Data: 360 days
[2/25] Training: Soybean @ Indore Mandi
  ✅ Done in 7.1s | MAPE: 0.041 | Data: 358 days
...
✅ Training complete!
   Trained: 25 models
   Time:    185.2s
```

---

### 4F — Start the ML service
```bash
uvicorn app.main:app --reload --port 8000
```

You'll see:
```
🌾 FasalAI ML Service starting...
✅ Loaded 25 pre-trained models
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) — you'll see the Swagger API docs! ✅

---

## ✅ Step 5 — Verify Everything Works

### Check 1 — Landing Page
Open [http://localhost:3000](http://localhost:3000)
You should see the FasalAI landing page with the price ticker ✅

### Check 2 — Sign Up
Click **"Get Started Free"** → Create an account with Clerk ✅

### Check 3 — Dashboard
After signing in, you're redirected to `/dashboard`
You should see the dashboard with crop prices ✅

### Check 4 — ML API
```bash
curl http://localhost:8000/health
```
Response: `{"status": "healthy", "models_loaded": 25, ...}` ✅

### Check 5 — Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Authorization: Bearer fasalai-dev-secret-123" \
  -H "Content-Type: application/json" \
  -d '{"crop_id": "crop-wheat", "mandi_id": "mandi-indore", "horizon": 7}'
```
Response: JSON with `predicted_price`, `confidence`, `trend` ✅

---

## 🐛 Common Errors & Fixes

---

### ❌ `prisma migrate dev` fails
**Error:** `Can't reach database server`
**Fix:** Check your `DATABASE_URL` in `.env.local` — copy it exactly from Neon dashboard

---

### ❌ `npm run db:seed` fails with "crop already exists"
**Fix:** This is safe to ignore — it means data was already seeded

---

### ❌ Clerk sign-in page shows "Invalid key"
**Fix:** Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` and is correct

---

### ❌ Python: `ModuleNotFoundError: prophet`
**Fix:** Make sure your venv is activated:
```bash
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows
```
Then retry: `pip install -r requirements.txt`

---

### ❌ ML service: `Connection refused` to database
**Fix:** Check `DATABASE_URL` in `fasalai-ml/.env` — same as Next.js

---

### ❌ Prophet training takes too long
**Fix:** Normal! Prophet is slow on first train. Subsequent predictions are fast (model cached in memory)

---

### ❌ `ML_SERVICE_URL` not connecting
**Fix:** Make sure Python service is running on port 8000 AND the secret matches exactly in both `.env` files

---

## 📁 Your Final Running Setup

```
Terminal 1 (Next.js):
  cd fasalai
  npm run dev
  → http://localhost:3000

Terminal 2 (Python ML):
  cd fasalai-ml
  source venv/bin/activate
  uvicorn app.main:app --reload --port 8000
  → http://localhost:8000
```

---

## 🚀 What's Next?

Once local is working:

1. **Deploy Next.js** → Push to GitHub → Connect to [Vercel](https://vercel.com)
   - Add all `.env.local` vars in Vercel dashboard
   - Build command: `prisma generate && prisma migrate deploy && next build`

2. **Deploy ML Service** → Push `fasalai-ml/` to GitHub → Connect to [Railway](https://railway.app)
   - Add `.env` vars in Railway dashboard
   - Railway auto-detects Dockerfile ✅

3. **Update `ML_SERVICE_URL`** in Vercel → paste your Railway public URL

4. **Connect real Agmarknet data** → Replace mock prices with live API

---

*Built with ❤️ for India's farmers · FasalAI 2026*
