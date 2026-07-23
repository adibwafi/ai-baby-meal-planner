# 🍼 Smart Fridge MPASI Optimizer

<div align="center">

**An AI-powered Progressive Web App that solves a real problem: helping Indonesian working mothers plan nutritionally-optimal baby food at 5:30 AM — before bathing, feeding, and commuting — so their children thrive during the golden first 1,000 days.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-▶%20Try%20Now-brightgreen?style=for-the-badge)](https://ai-baby-meal-planner-beta.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=for-the-badge)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Demo login: `recruiter@demo.com` / `demo1234`*

</div>

---

## 🎯 The Problem We're Solving

Every morning in Indonesia, millions of working mothers face the same impossible task:

> *"It's 5:00 AM. I need to cook something nutritious for my 8-month-old before 7:30 AM. I have random ingredients in the fridge, I don't know which nutrients my baby needs at this age, and I can't afford to get it wrong — these are the golden years for brain development."*

**MPASI (Makanan Pendamping ASI)** — complementary feeding for infants aged 6–24 months — is medically critical. Iron deficiency during this period causes irreversible cognitive impairment. Yet most mothers plan meals based on guesswork or WhatsApp group advice.

This app solves it in **under 30 seconds**, with AI that actually understands pediatric nutrition.

---

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI 5-Meal Daily Matrix** | LLaMA 3.3 70B generates age-appropriate Breakfast → AM Snack → Lunch → PM Snack → Dinner with textures, portions, and step-by-step instructions |
| ⚡ **Redis Semantic Cache** | Identical ingredient combos are cached 24h in Upstash Redis — ~60% faster on repeated queries |
| 📅 **Async 7-Day Planner** | Weekly plan generation via Upstash QStash job queue — never times out, real-time progress polling |
| 📊 **Nutrition Scoring** | WHO/Kemenkes-compliant scoring: iron, protein variety, vegetable coverage, breakfast time compliance |
| 🛒 **Smart Shopping Optimizer** | Consolidated weekly shopping list with grocery section grouping, IDR price estimates, WhatsApp export |
| 👶 **Multi-Child Profiles** | Each child has their own profile, allergen list, auto-computed age, and meal history |
| 🔒 **Allergen Guardrails** | Hard exclusion rules in AI system prompts — child-specific allergies are never recommended |
| 📱 **PWA + Offline Mode** | Installable, runs offline via Serwist service worker with localStorage fallback |
| 🌐 **Bilingual** | Full Bahasa Indonesia / English toggle |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (PWA)                            │
│  Next.js App Router · React 19 · Tailwind CSS v4 · Serwist SW  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    VERCEL EDGE (Serverless)                      │
│                                                                  │
│  POST /api/generate-meals                                        │
│  ├── Cache Key: SHA-256(sorted_ingredients + age + allergies)   │
│  ├── Cache HIT  ──→ Upstash Redis GET ──→ Return <50ms          │
│  └── Cache MISS ──→ Groq LLaMA 3.3 70B ──→ Redis SET (24h TTL)│
│                                                                  │
│  POST /api/weekly-plan  ──→ Upstash QStash (enqueue)           │
│  GET  /api/weekly-plan/[jobId]  ──→ Redis/Supabase poll        │
│                                                                  │
│  POST /api/nutrition-score  ──→ WHO scoring engine (pure logic) │
│  POST /api/shopping-optimize ──→ Ingredient diff + price est.  │
│  GET  /api/health  ──→ Live dependency health check             │
└──────────┬────────────────┬───────────────────────┬─────────────┘
           │                │                       │
┌──────────▼────┐  ┌────────▼────────┐  ┌──────────▼──────────┐
│  Groq API     │  │ Upstash Redis   │  │  Supabase Postgres   │
│  LLaMA 3.3    │  │ Semantic Cache  │  │  10-table relational │
│  70B (free)   │  │ + Job Status    │  │  schema + RLS        │
└───────────────┘  └────────┬────────┘  └─────────────────────┘
                            │
                   ┌────────▼────────┐
                   │ Upstash QStash  │
                   │ Background Jobs │
                   │ (async 7-day    │
                   │  plan gen)      │
                   └─────────────────┘
```

---

## 🛠️ Tech Stack (100% Free Tier)

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Framework** | Next.js 16.2 (App Router) | Edge-ready serverless functions, React 19 |
| **AI** | Groq + LLaMA 3.3 70B | 10x faster than OpenAI GPT-4o at same quality, free tier with high rate limits |
| **Cache** | Upstash Redis | Serverless-native Redis (HTTP REST API), zero cold start, 10k req/day free |
| **Job Queue** | Upstash QStash | Serverless message broker for background AI jobs, 500 msg/day free |
| **Database** | Supabase PostgreSQL | Full Postgres with RLS, real-time, Auth — 500MB free |
| **PWA** | Serwist (Workbox fork) | Service Worker precaching + offline app shell |
| **Deployment** | Vercel Hobby | Global CDN, serverless functions, CI/CD from GitHub |

---

## 🗄️ Database Schema

**10 relational tables** with proper FK constraints, computed columns, GIN indexes, and RLS policies:

```
user_profiles ──< children ──< meal_schedules ──< meal_entries
                     │                              │
                     └──< nutrition_logs ◄──────────┘
                     
fridge_inventory (per-user)
folders ──< favorite_meals (per-user, per-child)
nutrition_reference (master data: 15 common MPASI ingredients)
job_queue (async task tracking)
```

**Notable design decisions:**
- `children.age_months` is a **computed column** (`GENERATED ALWAYS AS`) — auto-updates from `birth_date`, never stale
- `meal_entries` has `UNIQUE(child_id, meal_date, meal_slot)` — prevents duplicate meal slots
- `nutrition_logs.portion_consumed` enum: `semua | setengah | sedikit | tidak_makan` — models real feeding behavior
- **GIN indexes** on `children.allergies[]` and `favorite_meals.tags[]` for fast array containment queries
- **Full RLS**: anon users get localStorage mode; authenticated users get isolated data

---

## 🔌 API Reference

### `POST /api/generate-meals`
Generates a 5-meal daily matrix. **Redis-cached** — identical ingredient combos return in <50ms.

```bash
curl -X POST https://ai-baby-meal-planner-beta.vercel.app/api/generate-meals \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["Dada Ayam", "Wortel", "Tahu", "Bayam"],
    "childName": "Adik",
    "childAgeMonths": 8,
    "allergies": ["Udang"]
  }'

# Response headers: X-Cache: HIT|MISS, X-Cache-Key: mpasi:meals:8m:a1b2c3d4
```

### `POST /api/weekly-plan` → `GET /api/weekly-plan/[jobId]`
Async 7-day plan via QStash. Returns `202 Accepted` with `jobId` instantly.

```bash
# 1. Enqueue (responds in <200ms)
curl -X POST .../api/weekly-plan \
  -d '{ "childName": "Adik", "childAgeMonths": 8, "allergies": [], "ingredientsByDay": [["Ayam","Wortel"],["Ikan","Tahu"],...] }'
# → { "jobId": "uuid", "status": "pending", "pollUrl": "/api/weekly-plan/uuid" }

# 2. Poll every 3s
curl .../api/weekly-plan/{jobId}
# → { "status": "processing", "progress": 3, "totalDays": 7 }
# → { "status": "done", "result": [ ...7 MealMatrix objects... ] }
```

### `POST /api/nutrition-score`
WHO/Kemenkes-compliant nutritional scoring of a meal matrix.

```bash
curl -X POST .../api/nutrition-score \
  -d '{ "matrix": { ...MealMatrix }, "allergens": ["Udang"], "ageMonths": 8 }'
# → { "overallScore": 87, "ironScore": 92, "badges": ["⚡ Sarapan Cepat < 30 Menit", "🥩 Kaya Zat Besi"] }
```

### `POST /api/shopping-optimize`
Consolidated shopping list with price estimates from 7-day plan.

```bash
curl -X POST .../api/shopping-optimize \
  -d '{ "weeklyPlan": [...], "currentFridge": ["Wortel","Tahu"] }'
# → { "totalItems": 8, "estimatedTotalIDR": 145000, "fridgeSavingsIDR": 35000, "whatsappText": "..." }
```

### `GET /api/health`
Live dependency health check for production monitoring.

```bash
curl https://ai-baby-meal-planner-beta.vercel.app/api/health
# → { "status": "ok|degraded", "services": { "groq": {...}, "supabase": {...}, "redis": {...}, "qstash": {...} } }
```

---

## ⚙️ Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/adibwafi/smart-fridge-mpasi-optimizer.git
cd smart-fridge-mpasi-optimizer
npm install
```

### 2. Configure Environment Variables
```env
# .env.local

# Required — get from console.groq.com (free)
GROQ_API_KEY=gsk_xxx

# Supabase (free at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Upstash Redis (free at upstash.com → Redis → REST API)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Upstash QStash (free at upstash.com → QStash)
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=sig_xxx
QSTASH_NEXT_SIGNING_KEY=sig_xxx

# App base URL (for QStash webhook routing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Database
Run [`supabase_schema.sql`](./supabase_schema.sql) in your **Supabase SQL Editor**.

### 4. Run Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Verify Connections
```bash
curl http://localhost:3000/api/health
```

---

## 📱 PWA Installation

1. Open the live demo on your phone
2. iOS: Safari → Share → **Add to Home Screen**
3. Android: Chrome → Menu → **Install App**
4. App launches instantly, works offline

---

## 🗺️ Roadmap

- [x] AI 5-Meal Daily Matrix with pediatric age brackets
- [x] Redis semantic caching layer
- [x] Async 7-day meal plan via QStash job queue
- [x] WHO-compliant nutrition scoring engine
- [x] Smart shopping optimizer with IDR pricing
- [x] Complex 10-table relational schema with RLS
- [x] PWA + offline service worker
- [ ] Supabase Auth (Google OAuth) + multi-tenant data isolation
- [ ] Nutritional intake tracking with weekly charts
- [ ] Flutter mobile shell (Android APK)
- [ ] Weight/height growth chart (WHO percentile curves)
- [ ] Push notifications for meal reminders

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

<div align="center">
<sub>Built with ❤️ for Indonesian working mothers. MPASI = Makanan Pendamping ASI (Complementary Foods for Breastfed Infants)</sub>
</div>
