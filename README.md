# 👶 Smart Fridge Baby Food Planner & Nutrition Optimizer

A mobile-first Progressive Web App (PWA) designed to help parents plan nutrient-dense complementary feeding (weaning) menus in seconds using fridge inventory and AI. 

Built with a **100% Free-Tier Architecture** for maximum cost efficiency, featuring offline database fallback, automated portion-size calculations, developmental milestone tracking, dynamic shopping list generation, and visual TikTok search integration for instant video recipes.

---

## 🌟 Key Features

1. **AI-Powered 5-Meal Daily Matrix**: Generates a tailored daily meal plan (Breakfast, AM Snack, Lunch, PM Snack, Dinner) using LLaMA 3.3 70B via Groq API.
2. **Interactive Fridge Inventory**: A tag-based inventory system with quick-add popular ingredients to track available fresh food.
3. **Automated Age-Appropriate Portions**: Automatically calculates and displays recommended serving portions based on the infant's age (e.g., spoonfuls for 6–8 months, volume for 12+ months).
4. **Developmental Milestone Tracker**: Displays localized motor skill progress and pediatric nutrition tips dynamically matched to the child’s age bracket.
5. **Smart Shopping List Generator**: Computes a missing ingredients list by comparing the AI's recipe requirements against the active fridge inventory, complete with WhatsApp sharing and clipboard copying.
6. **7-Day Menu History & Local Cache**: Automatically persists the last 7 generated meal matrices to local storage, allowing instant load without calling the API.
7. **Allergen & Safety Guardrails**: Hard constraints implemented at both prompt and routing levels to ensure allergen ingredients are never recommended.
8. **Supabase Cloud Sync with Offline Fallback**: Real-time cloud sync to Supabase PostgreSQL, automatically falling back to secure browser `localStorage` if database environment variables are absent.
9. **Visual Tutorial Search (TikTok integration)**: Dynamic search helper that redirects the user to recipe video tutorials matching the generated meal names.

---

## 🛠️ Tech Stack (100% Free Tier)

* **Frontend**: Next.js App Router (React, Tailwind CSS, TypeScript)
* **PWA Engine**: Serwist (Service Worker precaching, installable app shell, offline runtime support)
* **AI Orchestration**: Groq SDK + LLaMA 3.3 70B / LLaMA 4 Scout (Low latency, high token throughput)
* **Database**: Supabase PostgreSQL (Free Tier 500MB)
* **Deployment**: Vercel (Hobby Tier)

---

## 📊 Database Schema (Supabase DDL)

To set up the cloud sync feature, run the following SQL script in your Supabase **SQL Editor**:

```sql
-- 1. Table to store active fridge ingredients
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table to store custom recipe folder collections
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table to store favorited recipes and their category folder relations
CREATE TABLE favorite_meals (
  id TEXT PRIMARY KEY,
  folder_id TEXT DEFAULT 'default' REFERENCES folders(id) ON DELETE SET DEFAULT,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  cooking_time INTEGER NOT NULL,
  nutrition_highlight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pre-populate default folders
INSERT INTO folders (id, name) VALUES 
  ('default', 'All Favorites'),
  ('fast', 'Quick Breakfast'),
  ('nogtm', 'Anti-GTM / Appetite Booster')
ON CONFLICT (id) DO NOTHING;
```

---

## ⚙️ Local Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/adibwafi/smart-fridge-baby-food-optimizer.git
cd smart-fridge-baby-food-optimizer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (`.env.local`)
Create a file named `.env.local` in the root directory and add your API keys:

```env
# Groq Console API Key (Free Tier: console.groq.com)
GROQ_API_KEY=gsk_xxx...

# Optional: Supabase cloud sync keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

*Note: If Supabase keys are left blank, the application will automatically enter Local Fallback Mode, storing all data offline in the browser's localStorage.*

### 4. Run Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📱 Mobile Installation (PWA)

1. Access your deployed instance (must use HTTPS protocol).
2. Open the page in your mobile browser (Safari for iOS, Chrome for Android).
3. Tap the **Share** button (iOS) or **Three Dots Menu** (Android).
4. Select **"Add to Home Screen"**.
5. The app installs directly on your device, operating like a native application with offline support and instantaneous loading times.

---

## 📄 License

This project is licensed under the MIT License.
