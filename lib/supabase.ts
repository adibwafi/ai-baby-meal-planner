import { createClient } from "@supabase/supabase-js";

/* ── Supabase connection guard ─────────────────────────────────────── */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    !!key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder")
  );
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback logic to avoid runtime errors during build or if variables are temporarily missing.
// isSupabaseConfigured() should always be checked before making DB calls.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
