import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/* ── GET /api/health ───────────────────────────────────────────────── */
// Production-grade health check endpoint.
// Returns live connection status for each service dependency.
export async function GET() {
  const result: Record<string, string | boolean | object> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    services: {},
  };

  /* 1. Groq API Key ──────────────────────────────── */
  const groqKey = process.env.GROQ_API_KEY;
  (result.services as Record<string, unknown>).groq = groqKey
    ? { status: "configured", hint: `...${groqKey.slice(-6)}` }
    : { status: "missing", error: "GROQ_API_KEY not set" };

  /* 2. Supabase ──────────────────────────────────── */
  if (!isSupabaseConfigured()) {
    (result.services as Record<string, unknown>).supabase = {
      status: "not_configured",
      mode: "localStorage_fallback",
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables",
    };
  } else {
    try {
      // Lightweight ping: count rows in fridge_inventory (fast, no data leak)
      const { error } = await supabase
        .from("fridge_inventory")
        .select("id", { count: "planned", head: true });

      (result.services as Record<string, unknown>).supabase = error
        ? { status: "error", error: error.message }
        : { status: "connected", url: process.env.NEXT_PUBLIC_SUPABASE_URL };
    } catch (e) {
      (result.services as Record<string, unknown>).supabase = {
        status: "error",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  }

  /* 3. Upstash Redis ─────────────────────────────── */
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) {
    (result.services as Record<string, unknown>).redis = {
      status: "not_configured",
      hint: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for caching",
    };
  } else {
    try {
      const pingRes = await fetch(`${redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const pingData = await pingRes.json();
      (result.services as Record<string, unknown>).redis = {
        status: pingData.result === "PONG" ? "connected" : "error",
        response: pingData.result,
      };
    } catch (e) {
      (result.services as Record<string, unknown>).redis = {
        status: "error",
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  }

  /* 4. QStash ────────────────────────────────────── */
  const qstashToken = process.env.QSTASH_TOKEN;
  (result.services as Record<string, unknown>).qstash = qstashToken
    ? { status: "configured" }
    : { status: "not_configured", hint: "Set QSTASH_TOKEN for async job queue" };

  /* Determine overall status */
  const services = result.services as Record<string, { status: string }>;
  const allOk = Object.values(services).every(
    (s) => s.status === "connected" || s.status === "configured"
  );
  result.status = allOk ? "ok" : "degraded";

  return NextResponse.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
