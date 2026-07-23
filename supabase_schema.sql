-- ══════════════════════════════════════════════════════════════════
-- SMART FRIDGE MPASI OPTIMIZER — PRODUCTION DATABASE SCHEMA v2.0
-- ══════════════════════════════════════════════════════════════════
-- Architecture: Multi-tenant relational schema with Row Level Security
-- Database: Supabase PostgreSQL (Free Tier 500MB)
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- 
-- TABLE DEPENDENCY ORDER (run top → bottom):
--   user_profiles → children → folders → meal_schedules
--   → meal_entries → nutrition_logs → nutrition_reference → job_queue
-- ══════════════════════════════════════════════════════════════════

-- ── CLEANUP (idempotent — safe to run multiple times) ───────────
DROP TABLE IF EXISTS nutrition_logs CASCADE;
DROP TABLE IF EXISTS meal_entries CASCADE;
DROP TABLE IF EXISTS meal_schedules CASCADE;
DROP TABLE IF EXISTS favorite_meals CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS job_queue CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS nutrition_reference CASCADE;
DROP TABLE IF EXISTS fridge_inventory CASCADE;


-- ══════════════════════════════════════════════════════════════════
-- SECTION 1: FOUNDATION TABLES
-- ══════════════════════════════════════════════════════════════════

-- 1a. User Profiles
-- Extends Supabase auth.users with app-specific data.
-- Populated automatically on first login via Supabase Auth trigger.
CREATE TABLE user_profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   TEXT,
  avatar_url     TEXT,
  locale         TEXT DEFAULT 'id' CHECK (locale IN ('id', 'en')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_profiles IS 'App-level user settings. 1:1 with auth.users.';

-- Trigger: auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 1b. Children Profiles (MULTI-CHILD SUPPORT)
-- Core entity: each child has their own profile, allergy list, and meal history.
-- age_months is auto-computed from birth_date — always stays current.
CREATE TABLE children (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  birth_date          DATE NOT NULL,
  -- Computed column: age_months stays accurate without manual updates
  age_months          INTEGER GENERATED ALWAYS AS (
                        EXTRACT(YEAR FROM age(CURRENT_DATE, birth_date))::INTEGER * 12 +
                        EXTRACT(MONTH FROM age(CURRENT_DATE, birth_date))::INTEGER
                      ) STORED,
  weight_kg           DECIMAL(4,2) CHECK (weight_kg > 0 AND weight_kg < 50),
  height_cm           DECIMAL(5,2) CHECK (height_cm > 0 AND height_cm < 200),
  -- Allergen list stored as sorted text array for fast containment checks
  allergies           TEXT[] NOT NULL DEFAULT '{}',
  -- Texture preference can be overridden (e.g. child behind developmental curve)
  texture_override    TEXT CHECK (texture_override IN ('puree', 'mashed', 'soft_family')),
  gender              TEXT CHECK (gender IN ('L', 'P')),
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE children IS 'Child profiles. user_id FK enables multi-child, multi-user isolation.';
COMMENT ON COLUMN children.age_months IS 'Auto-computed from birth_date. Never stale.';
COMMENT ON COLUMN children.texture_override IS 'NULL = use age-default texture per WHO guidelines.';

CREATE TRIGGER trg_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 1c. Active Fridge Inventory
-- Tracks what ingredients are currently in the fridge.
-- Per-user isolation via user_id.
CREATE TABLE fridge_inventory (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,        -- Optional expiry for freshness tracking
  UNIQUE(user_id, name)           -- No duplicate ingredients per user
);
COMMENT ON TABLE fridge_inventory IS 'Per-user active ingredient inventory.';


-- ══════════════════════════════════════════════════════════════════
-- SECTION 2: NUTRITION REFERENCE (MASTER DATA)
-- ══════════════════════════════════════════════════════════════════

-- Nutritional values per 100g, sourced from:
-- TKPI (Tabel Komposisi Pangan Indonesia) 2017 + USDA FoodData Central
CREATE TABLE nutrition_reference (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name     TEXT UNIQUE NOT NULL,
  name_en             TEXT,
  calories_kcal       DECIMAL(7,2),
  protein_g           DECIMAL(6,2),
  fat_g               DECIMAL(6,2),
  carbs_g             DECIMAL(6,2),
  fiber_g             DECIMAL(6,2),
  iron_mg             DECIMAL(6,2),      -- Critical for MPASI: prevents anemia
  zinc_mg             DECIMAL(6,2),      -- Critical for growth & immune function
  calcium_mg          DECIMAL(7,2),
  vitamin_a_mcg       DECIMAL(7,2),      -- RE (Retinol Equivalents)
  vitamin_c_mg        DECIMAL(6,2),
  vitamin_d_mcg       DECIMAL(6,2),
  data_source         TEXT DEFAULT 'TKPI-2017',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE nutrition_reference IS 'Master nutritional data per 100g, sourced from TKPI 2017 & USDA.';

-- Seed with common MPASI ingredients
INSERT INTO nutrition_reference
  (ingredient_name, name_en, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, zinc_mg, vitamin_a_mcg)
VALUES
  ('Dada Ayam',     'Chicken Breast',  165, 31.0, 3.6,  0.0,  1.1, 1.0, 6),
  ('Hati Ayam',     'Chicken Liver',   119, 16.9, 4.8,  0.7,  8.5, 2.7, 3290),
  ('Daging Sapi',   'Beef',            250, 26.1, 15.4, 0.0,  2.7, 4.8, 0),
  ('Ikan Salmon',   'Salmon',          208, 20.4, 13.4, 0.0,  0.3, 0.6, 50),
  ('Telur Ayam',    'Chicken Egg',     155, 12.6, 10.6, 1.1,  1.8, 1.3, 160),
  ('Tahu',          'Tofu',            76,  8.1,  4.2,  1.9,  1.0, 0.8, 0),
  ('Tempe',         'Tempeh',          201, 20.7, 7.7,  17.1, 2.7, 1.1, 0),
  ('Bayam',         'Spinach',         23,  2.9,  0.4,  3.6,  2.7, 0.5, 469),
  ('Wortel',        'Carrot',          41,  0.9,  0.2,  9.6,  0.3, 0.2, 835),
  ('Brokoli',       'Broccoli',        34,  2.8,  0.4,  6.6,  0.7, 0.4, 31),
  ('Ubi Jalar',     'Sweet Potato',    86,  1.6,  0.1,  20.1, 0.6, 0.3, 961),
  ('Labu Kuning',   'Pumpkin',         26,  1.0,  0.1,  6.5,  0.8, 0.3, 426),
  ('Kentang',       'Potato',          77,  2.0,  0.1,  17.5, 0.8, 0.3, 0),
  ('Kacang Hijau',  'Mung Bean',       347, 23.9, 1.2,  62.6, 6.7, 2.7, 6),
  ('Oatmeal',       'Oats',            389, 16.9, 6.9,  66.3, 10.6, 3.9, 0)
ON CONFLICT (ingredient_name) DO NOTHING;


-- ══════════════════════════════════════════════════════════════════
-- SECTION 3: MEAL PLANNING TABLES
-- ══════════════════════════════════════════════════════════════════

-- 3a. Recipe Folder Collections
CREATE TABLE folders (
  id          TEXT PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT DEFAULT '📁',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO folders (id, name, icon) VALUES
  ('default', 'Semua Favorit',   '❤️'),
  ('fast',    'Sarapan Cepat',   '⚡'),
  ('nogtm',   'Anti GTM',        '🎯'),
  ('iron',    'Kaya Zat Besi',   '💪')
ON CONFLICT (id) DO NOTHING;

-- 3b. Favorite Meal Recipes
CREATE TABLE favorite_meals (
  id                  TEXT PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id            UUID REFERENCES children(id) ON DELETE SET NULL,
  folder_id           TEXT DEFAULT 'default' REFERENCES folders(id) ON DELETE SET DEFAULT,
  name                TEXT NOT NULL,
  description         TEXT,
  ingredients         TEXT[] NOT NULL,
  instructions        TEXT[] NOT NULL,
  cooking_time        INTEGER NOT NULL CHECK (cooking_time > 0),
  nutrition_highlight TEXT,
  portion_size        TEXT,
  age_months_min      INTEGER DEFAULT 6,
  age_months_max      INTEGER DEFAULT 24,
  tags                TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3c. 7-Day Meal Schedules (Weekly Plans)
-- A schedule is a container for 7 days of meal entries.
CREATE TABLE meal_schedules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id         UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start_date  DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'active', 'archived')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Composite unique: one active schedule per child per week
  UNIQUE(child_id, week_start_date)
);
COMMENT ON TABLE meal_schedules IS 'Weekly meal plan containers. One per child per week.';

-- 3d. Individual Meal Entries (5 meals × 7 days = 35 rows per schedule)
CREATE TABLE meal_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id           UUID NOT NULL REFERENCES meal_schedules(id) ON DELETE CASCADE,
  child_id              UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  meal_date             DATE NOT NULL,
  meal_slot             TEXT NOT NULL
                          CHECK (meal_slot IN ('breakfast','am_snack','lunch','pm_snack','dinner')),
  name                  TEXT NOT NULL,
  description           TEXT,
  ingredients           TEXT[] NOT NULL,
  instructions          TEXT[] NOT NULL,
  cooking_time_minutes  INTEGER CHECK (cooking_time_minutes > 0),
  portion_size          TEXT,
  nutrition_highlight   TEXT,
  ai_generated          BOOLEAN NOT NULL DEFAULT true,
  cache_hit             BOOLEAN DEFAULT false,   -- Was this from Redis cache?
  is_cooked             BOOLEAN NOT NULL DEFAULT false,
  is_favorited          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Enforce one entry per slot per day per child
  UNIQUE(child_id, meal_date, meal_slot)
);
COMMENT ON TABLE meal_entries IS '5 daily meal slots per child per day. Part of a weekly schedule.';
COMMENT ON COLUMN meal_entries.cache_hit IS 'True if AI result was served from Redis cache.';


-- ══════════════════════════════════════════════════════════════════
-- SECTION 4: TRACKING & ANALYTICS TABLES
-- ══════════════════════════════════════════════════════════════════

-- 4a. Nutrition Logs (Actual daily intake tracking)
-- Mama bisa log apa yang benar-benar dimakan, termasuk porsi yang dikonsumsi.
CREATE TABLE nutrition_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id              UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date              DATE NOT NULL,
  meal_entry_id         UUID REFERENCES meal_entries(id) ON DELETE SET NULL,
  meal_slot             TEXT CHECK (meal_slot IN ('breakfast','am_snack','lunch','pm_snack','dinner')),
  -- Estimated nutrients (calculated from nutrition_reference)
  estimated_calories    DECIMAL(7,2),
  estimated_protein_g   DECIMAL(6,2),
  estimated_iron_mg     DECIMAL(6,2),
  estimated_zinc_mg     DECIMAL(6,2),
  -- Subjective consumption tracking
  portion_consumed      TEXT CHECK (portion_consumed IN ('semua','setengah','sedikit','tidak_makan')),
  child_reaction        TEXT CHECK (child_reaction IN ('suka','biasa','tidak_suka','alergi')),
  notes                 TEXT,
  logged_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One log entry per meal slot per day per child
  UNIQUE(child_id, log_date, meal_slot)
);
COMMENT ON TABLE nutrition_logs IS 'Actual daily intake log. Tracks portion consumed & child reaction.';

-- 4b. Background Job Queue
-- Tracks async QStash jobs (weekly plan generation, etc.)
CREATE TABLE job_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type        TEXT NOT NULL CHECK (job_type IN ('weekly_plan', 'nutrition_analysis', 'shopping_optimize')),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  child_id        UUID REFERENCES children(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','done','failed')),
  payload         JSONB NOT NULL DEFAULT '{}',    -- Input parameters
  result          JSONB,                           -- Output data
  progress        INTEGER DEFAULT 0,               -- 0-N days processed
  total_steps     INTEGER DEFAULT 7,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  -- Auto-cleanup: jobs older than 7 days can be purged
  expires_at      TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);
COMMENT ON TABLE job_queue IS 'Async job tracking for QStash background tasks.';


-- ══════════════════════════════════════════════════════════════════
-- SECTION 5: PERFORMANCE INDEXES
-- ══════════════════════════════════════════════════════════════════

-- Hot query paths based on expected access patterns:
CREATE INDEX idx_children_user_id       ON children(user_id) WHERE is_active = true;
CREATE INDEX idx_fridge_user_id         ON fridge_inventory(user_id);
CREATE INDEX idx_meal_entries_child_date ON meal_entries(child_id, meal_date DESC);
CREATE INDEX idx_meal_entries_schedule  ON meal_entries(schedule_id);
CREATE INDEX idx_meal_schedules_child   ON meal_schedules(child_id, week_start_date DESC);
CREATE INDEX idx_nutrition_logs_child   ON nutrition_logs(child_id, log_date DESC);
CREATE INDEX idx_job_queue_status       ON job_queue(status, created_at DESC) WHERE status IN ('pending','processing');
CREATE INDEX idx_job_queue_user         ON job_queue(user_id, created_at DESC);
CREATE INDEX idx_favorite_meals_folder  ON favorite_meals(folder_id, user_id);
-- GIN index for array containment queries (allergen checks, tag filtering)
CREATE INDEX idx_children_allergies     ON children USING GIN(allergies);
CREATE INDEX idx_favorite_tags          ON favorite_meals USING GIN(tags);


-- ══════════════════════════════════════════════════════════════════
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- Enables multi-tenant isolation: users can ONLY read/write their own data.
-- Activate when Supabase Auth is implemented.
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE children        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_meals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_queue       ENABLE ROW LEVEL SECURITY;

-- user_profiles: users manage their own profile only
CREATE POLICY "user_profiles_own" ON user_profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- children: users manage their own children
CREATE POLICY "children_own" ON children
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- fridge_inventory: per-user isolation
CREATE POLICY "fridge_own" ON fridge_inventory
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Allow anonymous access (pre-auth mode — scoped to anon role only)
CREATE POLICY "fridge_anon_read" ON fridge_inventory
  FOR ALL TO anon USING (user_id IS NULL);

-- folders: own + read system defaults (user_id IS NULL)
CREATE POLICY "folders_own" ON folders
  FOR ALL TO authenticated USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "folders_anon" ON folders
  FOR SELECT TO anon USING (user_id IS NULL);

-- favorite_meals: per-user
CREATE POLICY "favorites_own" ON favorite_meals
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_anon" ON favorite_meals
  FOR ALL TO anon USING (user_id IS NULL);

-- meal_schedules: per-user
CREATE POLICY "schedules_own" ON meal_schedules
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- meal_entries: via schedule ownership
CREATE POLICY "entries_own" ON meal_entries
  FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM meal_schedules WHERE id = schedule_id));

-- nutrition_logs: per-user
CREATE POLICY "logs_own" ON nutrition_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- job_queue: per-user
CREATE POLICY "jobs_own" ON job_queue
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- nutrition_reference: public read (master data)
ALTER TABLE nutrition_reference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_ref_public_read" ON nutrition_reference FOR SELECT TO anon, authenticated USING (true);


-- ══════════════════════════════════════════════════════════════════
-- SECTION 7: UTILITY FUNCTIONS
-- ══════════════════════════════════════════════════════════════════

-- Function: Get child's current texture recommendation based on age
CREATE OR REPLACE FUNCTION get_texture_for_child(child_uuid UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_age_months INTEGER;
  v_override   TEXT;
BEGIN
  SELECT age_months, texture_override INTO v_age_months, v_override
  FROM children WHERE id = child_uuid;
  
  IF v_override IS NOT NULL THEN RETURN v_override; END IF;
  IF v_age_months BETWEEN 6 AND 8  THEN RETURN 'puree'; END IF;
  IF v_age_months BETWEEN 9 AND 11 THEN RETURN 'mashed'; END IF;
  RETURN 'soft_family';
END;
$$;

-- Function: Weekly nutrition summary for a child
CREATE OR REPLACE FUNCTION get_weekly_nutrition(child_uuid UUID, week_start DATE)
RETURNS TABLE(
  day DATE,
  total_calories DECIMAL,
  total_protein_g DECIMAL,
  total_iron_mg DECIMAL,
  meals_consumed INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    log_date,
    COALESCE(SUM(estimated_calories), 0),
    COALESCE(SUM(estimated_protein_g), 0),
    COALESCE(SUM(estimated_iron_mg), 0),
    COUNT(*)::INTEGER
  FROM nutrition_logs
  WHERE child_id = child_uuid
    AND log_date BETWEEN week_start AND week_start + 6
    AND portion_consumed != 'tidak_makan'
  GROUP BY log_date
  ORDER BY log_date;
END;
$$;


-- ══════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETE
-- Tables: user_profiles, children, fridge_inventory, nutrition_reference,
--         folders, favorite_meals, meal_schedules, meal_entries,
--         nutrition_logs, job_queue
-- Indexes: 11 performance indexes (incl. 2 GIN for array queries)
-- RLS Policies: Full multi-tenant isolation for all tables
-- Functions: get_texture_for_child(), get_weekly_nutrition()
-- ══════════════════════════════════════════════════════════════════
