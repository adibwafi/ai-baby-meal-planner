-- ──────────────────────────────────────────────────────────
-- SMART FRIDGE MPASI OPTIMIZER — DATABASE INITIALIZATION DDL
-- ──────────────────────────────────────────────────────────
-- Buka Dashboard Supabase Anda -> SQL Editor -> Tempel & Jalankan kode ini.

-- 1. Bersihkan tabel jika ada sebelumnya (opsional)
DROP TABLE IF EXISTS favorite_meals;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS fridge_inventory;

-- 2. Tabel untuk menyimpan bahan kulkas aktif Mama
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel untuk menyimpan folder koleksi favorit Mama
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel untuk menyimpan resep favorit Mama beserta relasi kategorinya
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

-- 5. Insert beberapa folder bawaan (default)
INSERT INTO folders (id, name) VALUES 
  ('default', 'Semua Favorit'),
  ('fast', 'Sarapan Cepat'),
  ('nogtm', 'Anti GTM')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- FUTURE SAAS TRANSITION: MULTI-TENANT SCHEMA (DOCUMENTATION)
-- ──────────────────────────────────────────────────────────
-- Untuk meningkatkan aplikasi ini menjadi B2C SaaS Multi-Tenant sejati:
--
-- 1. Hubungkan dengan Supabase Auth dan tambahkan kolom pemilik di setiap tabel:
--    ALTER TABLE fridge_inventory ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
--    ALTER TABLE folders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
--    ALTER TABLE favorite_meals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- 2. Jalankan skema tabel Profil Anak berikut:
--    CREATE TABLE children (
--      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--      name TEXT NOT NULL,
--      age_months INTEGER NOT NULL CHECK (age_months >= 6 AND age_months <= 36),
--      allergies TEXT[] DEFAULT '{}',
--      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
--    );
--
-- 3. Aktifkan Row Level Security (RLS) agar user hanya bisa membaca data milik mereka sendiri:
--    ALTER TABLE children ENABLE ROW LEVEL SECURITY;
--    CREATE POLICY "Users can manage their own children profile" ON children
--      FOR ALL TO authenticated USING (auth.uid() = user_id);
--
--    ALTER TABLE fridge_inventory ENABLE ROW LEVEL SECURITY;
--    CREATE POLICY "Users can manage their own fridge items" ON fridge_inventory
--      FOR ALL TO authenticated USING (auth.uid() = user_id);

