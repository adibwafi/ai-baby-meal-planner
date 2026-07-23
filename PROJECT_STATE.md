# PROJECT_STATE.md — Single Source of Truth

**Project Name:** Smart Fridge MPASI Optimizer & Baby Food Planner  
**Repository:** `adibwafi/smart-fridge-mpasi-optimizer`  
**Last Updated:** July 23, 2026  
**Architecture Type:** Mobile-first Next.js PWA + Serverless AI + Supabase Hybrid Offline + Flutter Mobile Shell  

---

## 1. EXECUTIVE SUMMARY & TECH STACK

### Core Purpose & Scope
The **Smart Fridge MPASI Optimizer** is a Progressive Web Application (PWA) designed to solve daily complementary feeding (MPASI - *Makanan Pendamping ASI*) menu planning for infants aged 6 to 24 months. It takes active fridge ingredients, child age, and allergen constraints, then leverages LLaMA 3.3 70B via the Groq API to generate a balanced 5-meal daily matrix (Breakfast, AM Snack, Lunch, PM Snack, Dinner) with age-appropriate textures, portion sizes, cooking times, and step-by-step instructions.

### Complete Technology Stack
* **Framework:** Next.js 16.2.9 (App Router, Turbopack for `dev`, Webpack for `build`)
* **UI & Core:** React 19.2.4, TypeScript 5.x, Tailwind CSS v4 (`@tailwindcss/postcss`)
* **PWA Engine:** `@serwist/next` (v9.5.11) & `serwist` (Service Worker precaching, runtime caching, offline app shell)
* **AI Orchestration:** `groq-sdk` (v1.3.0) invoking model `llama-3.3-70b-versatile`. (`@google/generative-ai` v0.24.1 installed as secondary dependency).
* **Database & Cloud Storage:** Supabase PostgreSQL (`@supabase/supabase-js` v2.108.2) with automatic browser `localStorage` offline fallback.
* **State Management:** React local state (`useState`, `useMemo`, `useEffect`) + sync layer (Supabase / `localStorage`).
* **Mobile Shell:** Flutter SDK workspace skeleton located in `/mobile`.

### Key Configurations
* **Next.js Config (`next.config.ts`):** Wrapped with `withSerwist` (`swSrc: "public/sw.ts"`, disabled in dev mode). `reactStrictMode: true`.
* **API Key Env Vars (`.env.local`):**
  * `GROQ_API_KEY` (Required for AI generation route)
  * `NEXT_PUBLIC_SUPABASE_URL` (Optional for cloud sync)
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Optional for cloud sync)

---

## 2. PROJECT STRUCTURE & ARCHITECTURE

### Directory Tree
```
smart-fridge-mpasi-optimizer/
├── app/
│   ├── api/
│   │   └── generate-meals/
│   │       └── route.ts         # POST route handling Groq LLaMA prompt & JSON response parsing
│   ├── globals.css              # Custom CSS design system, color tokens, animations, Tailwind v4
│   ├── layout.tsx               # Root layout, PWA meta tags, viewport settings, max-width wrapper
│   └── page.tsx                 # Monolithic main SPA component (~2042 lines: UI, tabs, state, modals)
├── lib/
│   └── supabase.ts              # Supabase client singleton with build-time fallback credentials
├── mobile/                      # Flutter mobile project skeleton (android, ios, lib, test, web, etc.)
│   └── lib/                     # Flutter source directory (models, providers, screens, services)
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── sw.ts                    # Serwist service worker source
│   ├── sw.js                    # Compiled service worker bundle
│   └── icon-192.png, icon-512.png # App icons
├── .env.local.example           # Environment template
├── AGENTS.md / CLAUDE.md        # AI coding rules & reference directives
├── next.config.ts               # Serwist PWA build wrapper
├── package.json                 # Core dependencies & scripts
├── supabase_schema.sql          # Supabase SQL DDL & multi-tenant SaaS upgrade documentation
└── tsconfig.json                # TypeScript configuration
```

### Architectural Patterns Applied
1. **Single-Page Application (SPA) inside App Router:** Tab navigation (`home`, `favorites`, `settings`) managed via React client-side state within `app/page.tsx`.
2. **Hybrid Storage & Offline-First Strategy:** All database operations (fridge inventory, folder creation, saving favorites) perform cloud sync when Supabase environment variables exist, gracefully degrading to `localStorage` when offline or unconfigured.
3. **Edge/Serverless AI Proxy Pattern:** `app/api/generate-meals/route.ts` hides `GROQ_API_KEY`, dynamically constructs system prompts based on baby age and allergies, and enforces strict JSON output schemas from LLMs.
4. **Responsive Mobile-First Container:** Encapsulated in a `max-w-[480px]` container on mobile devices, expanding into a 12-column side-by-side grid layout on desktop viewports (`md:max-w-6xl`).

---

## 3. CURRENT IMPLEMENTATION STATE & DATA FLOW

### Active Built Modules & Features
1. **AI 5-Meal Daily Matrix Generator:** Generates Breakfast (cooked in <30m), AM Snack, Lunch, PM Snack, and Dinner with short instructions (max 4 steps), portion sizes, and nutrition highlights.
2. **Interactive Tag Inventory:** Add/remove ingredients with keyboard shortcuts (`Enter`, `,`, `Backspace`) and pre-populated quick-add chips.
3. **Pediatric Age Bracket & Texture Rules:** Interactive age selector (6-8m: Smooth Puree; 9-11m: Lumpy/Mashed; 12-24m: Soft Family Food).
4. **Developmental Milestone Tracker:** Displays motor skills and pediatrician tips (`MILESTONE_DATA`) dynamically tuned to the selected age bracket.
5. **Allergen Guardrail Engine:** Hard exclusion rules appended to LLM system prompts for child-specific allergies.
6. **Smart Shopping List Generator:** Real-time array diffing comparing recipe ingredients against active fridge stock, complete with clipboard copy and WhatsApp formatting.
7. **Kitchen Mode (Visual Step-by-Step Cooking Modal):** Fullscreen interactive cooking walkthrough with step action icons (`🔪`, `💧`, `🍳`, `🥣`, `🍽️`), step-by-step progress dots, and celebration screens.
8. **Favorite Recipe Collections & Folders:** Folder categorization system ("All Favorites", "Quick Breakfast", "Anti GTM", or custom user folders) with cloud sync.
9. **7-Day Menu History:** Auto-persists generated matrices in browser storage with instant load capability.
10. **TikTok Video Tutorial Redirect:** Dynamic link generator opening TikTok search results for dish video tutorials (`https://www.tiktok.com/search?q=...`).
11. **Bilingual i18n Dictionary:** Instant toggle between Bahasa Indonesia (`id`) and English (`en`).

### Database Schema (`supabase_schema.sql`)
```sql
-- 1. Active Fridge Inventory
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Recipe Folder Collections
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Favorited Recipes
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
```

### API Endpoint & Data Flow
* **`POST /api/generate-meals`**
  * **Input Payload:**
    ```json
    {
      "ingredients": ["Dada Ayam", "Wortel", "Tahu"],
      "allergies": ["Udang"],
      "childName": "Adik",
      "childAgeMonths": 8
    }
    ```
  * **Processing:** Validates payload -> constructs dynamic system prompt with pediatric rules & allergen exclusion -> calls Groq API `llama-3.3-70b-versatile` -> strips markdown fences -> parses JSON -> validates presence of all 5 slots -> adds metadata timestamp.
  * **Response Payload:** `{ "matrix": MealMatrix }`

---

## 4. REMAINING TASKS, TODOs & TECHNICAL DEBT

### Technical Debt & Refactoring Requirements
1. **Monolithic UI File (`app/page.tsx`):**
   * Currently ~2042 lines long. Contains translations, static milestone data, SVG icons, subcomponents (`MealCard`, `SkeletonCard`, `PlaceholderCard`), and main page state.
   * **Action Required:** Refactor into separate modular components in `components/` (e.g., `components/fridge/`, `components/meals/`, `components/cooking/`, `components/favorites/`, `components/settings/`, `components/ui/`).
2. **Database Multi-Tenant Isolation:**
   * Current Supabase schema lacks `user_id` foreign keys and Row Level Security (RLS) policies. Currently operates as single-tenant shared tables.
   * **Action Required:** Execute multi-tenant DDL migration (documented in `supabase_schema.sql`) when introducing Supabase Auth.
3. **Flutter Mobile Workspace (`mobile/`):**
   * Subdirectories (`screens/tabs`, `models`, `providers`, `services`) exist as empty stubs.
   * **Action Required:** Either implement Flutter frontend services connecting to Next.js API endpoints or archive if PWA is the sole target.
4. **Unused Dependency:**
   * `@google/generative-ai` is installed in `package.json` but unreferenced in code.
   * **Action Required:** Either add Google Gemini fallback logic in `app/api/generate-meals/route.ts` or remove package.

### Remaining Features & Enhancements
* [ ] Refactor monolithic `app/page.tsx` into modular components.
* [ ] Implement Supabase Auth (Email / Google OAuth) and multi-tenant RLS policies.
* [ ] Add PDF / Image export feature for printing weekly MPASI meal matrices for nannies/caregivers.
* [ ] Add nutritional breakdown visualization (estimated protein, iron, fats, carbs per meal slot).

---

## 5. AI AGENT CODING GUIDELINES

### Naming Conventions & Placement Rules
* **React Components:** PascalCase (`MealCard.tsx`, `FridgeInventory.tsx`). Place reusable components in `/components`.
* **State & Functions:** camelCase (`addIngredient`, `saveProfileData`, `handleInitiateSave`).
* **Types / Interfaces:** PascalCase (`MealEntry`, `MealMatrix`, `HistoryEntry`). Define API interfaces in `app/api/.../route.ts` or dedicated `types/` files.
* **Styling Tokens:** Use HSL/CSS token variables in `app/globals.css` (e.g., `var(--color-brand-primary)`, `var(--bg-elevated)`, `var(--border-default)`).
* **Client Directives:** Always add `"use client";` at line 1 for Next.js interactive client components.

### Standard Step-by-Step Feature Implementation Workflow
1. **Define Data Contracts:** Update TypeScript interfaces in route handlers or `types/` file.
2. **Database Schema:** Update `supabase_schema.sql` and run migration in Supabase SQL editor if database structural changes are required.
3. **Backend API:** Implement or update serverless POST/GET route handlers under `app/api/<feature>/route.ts`.
4. **Frontend UI Component:** Build or update UI components using CSS variables from `app/globals.css`.
5. **State & Sync Layer:** Wire component state to update local state, sync with Supabase cloud if configured, and save fallback to `localStorage`.
6. **Validation & Verification:** Run `npm run build` to confirm zero TypeScript compilation errors and static page generation.
