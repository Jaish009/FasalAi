# 🌾 FasalAI — Mandi Price Tracker

> AI-powered mandi price intelligence platform for Indian farmers.
> Real-time prices · AI predictions · Smart alerts · Hindi + English

---

## 🚀 Quick Setup (Step by Step)

### Step 1 — Clone & Install
```bash
git clone https://github.com/yourusername/fasalai.git
cd fasalai
npm install
```

### Step 2 — Setup Environment Variables
```bash
cp .env.example .env.local
```
Then fill in your API keys in `.env.local` (see keys needed below).

### Step 3 — Setup Database
```bash
# Push schema to your Neon DB
npx prisma migrate dev --name init

# Seed with initial crops & mandis data
npm run db:seed
```

### Step 4 — Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 API Keys You Need

| Service | What For | Get It |
|---------|----------|--------|
| **Neon** | PostgreSQL Database | [neon.tech](https://neon.tech) — Free tier |
| **Clerk** | Authentication | [clerk.com](https://clerk.com) — Free tier |
| **Resend** | Email notifications | [resend.com](https://resend.com) — Free tier |
| **Twilio** | SMS & WhatsApp alerts | [twilio.com](https://twilio.com) — Trial available |
| **Agmarknet** | Government mandi data | [agmarknet.gov.in](https://agmarknet.gov.in) — Free |
| **OpenWeatherMap** | Weather data | [openweathermap.org](https://openweathermap.org) — Free tier |

---

## 📁 Project Structure

```
fasalai/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Initial data seeder
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── crops/         # Crop listing API
│   │   │   ├── prices/        # Price data API (Agmarknet)
│   │   │   ├── mandis/        # Mandi search API
│   │   │   ├── alerts/        # Alert CRUD API
│   │   │   ├── predictions/   # AI prediction API
│   │   │   └── users/sync/    # Clerk user sync
│   │   ├── dashboard/         # Dashboard page
│   │   ├── sign-in/           # Clerk auth pages
│   │   └── layout.tsx         # Root layout with Clerk
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── agmarknet.ts       # Agmarknet API integration
│   │   ├── twilio.ts          # SMS & WhatsApp service
│   │   └── resend.ts          # Email service + templates
│   │
│   ├── middleware.ts           # Clerk auth middleware
│   └── types/index.ts         # TypeScript types
│
└── .env.example               # Environment variables template
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL + Prisma ORM |
| Auth | Clerk |
| Email | Resend + React Email |
| SMS/WhatsApp | Twilio |
| Price Data | Agmarknet API (Government of India) |
| AI Prediction | Python FastAPI + Prophet ML |
| Deployment | Vercel (frontend) + Railway (ML service) |

---

## 📦 Modules Built

- [x] **Module 1** — UI & Landing Page (HTML)
- [x] **Module 2** — Backend & Database (this module)
  - [x] Prisma Schema (8 models)
  - [x] Database Seed (10 crops, 5 mandis)
  - [x] API Routes (crops, prices, mandis, alerts, users, predictions)
  - [x] Agmarknet Integration
  - [x] Clerk Middleware & User Sync
  - [x] Twilio SMS & WhatsApp Service
  - [x] Resend Email Templates
- [ ] **Module 3** — Dashboard UI Components (Next)
- [ ] **Module 4** — Python ML Service (Prophet AI)

---

## 🚢 Deployment

### Vercel
```bash
# Build command
prisma generate && prisma migrate deploy && next build

# Environment: Set all .env.local vars in Vercel dashboard
```

### Railway (for ML service)
Deploy the `ml-service/` folder separately as a Python FastAPI app.

---

*Built with ❤️ for India's farmers · FasalAI 2026*
