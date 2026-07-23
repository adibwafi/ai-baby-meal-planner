import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/* ── Redis client ─────────────────────────────────────── */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/* ── GET /api/weekly-plan/[jobId] ─────────────────────── */
// Polling endpoint for async weekly plan job status.
// Frontend polls this every 3 seconds until status = "done" | "failed".
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: "jobId wajib diisi." }, { status: 400 });
  }

  /* 1. Check Redis first (fastest) */
  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get<Record<string, unknown>>(`mpasi:job:${jobId}`);
      if (cached) {
        return NextResponse.json(cached, {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    } catch (e) {
      console.warn("[weekly-plan GET] Redis error (non-fatal):", e);
    }
  }

  /* 2. Fallback: check Supabase job_queue */
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("job_queue")
      .select("id, status, payload, result, error_message, created_at, completed_at")
      .eq("id", jobId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Job tidak ditemukan.", jobId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        jobId: data.id,
        status: data.status,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        result: data.result,
        error: data.error_message,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  return NextResponse.json(
    {
      error: "Job tidak ditemukan. Redis atau Supabase belum dikonfigurasi.",
      jobId,
    },
    { status: 404 }
  );
}
