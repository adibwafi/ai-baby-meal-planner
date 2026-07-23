import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/* ── Types ────────────────────────────────────────────── */
export interface WeeklyPlanRequest {
  childId?: string;
  childName: string;
  childAgeMonths: number;
  allergies: string[];
  ingredientsByDay: string[][];   // Array of 7 ingredient lists, one per day
}

export interface WeeklyPlanJob {
  jobId: string;
  status: "pending" | "processing" | "done" | "failed";
  createdAt: string;
  completedAt?: string;
  progress?: number;              // 0-7 days processed
  totalDays: number;
  result?: unknown[];
  error?: string;
}

/* ── Redis client ─────────────────────────────────────── */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/* ── POST /api/weekly-plan ────────────────────────────── */
// Enqueues a weekly meal plan generation job via QStash.
// Responds INSTANTLY with a jobId — no waiting for AI processing.
export async function POST(request: NextRequest) {
  try {
    const body: WeeklyPlanRequest = await request.json();

    /* Validate */
    if (!body.childName || !body.childAgeMonths) {
      return NextResponse.json(
        { error: "childName dan childAgeMonths wajib diisi." },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.ingredientsByDay) || body.ingredientsByDay.length === 0) {
      return NextResponse.json(
        { error: "ingredientsByDay harus berupa array berisi minimal 1 hari." },
        { status: 400 }
      );
    }
    const days = Math.min(body.ingredientsByDay.length, 7);

    /* Create job record */
    const jobId = uuidv4();
    const createdAt = new Date().toISOString();
    const job: WeeklyPlanJob = {
      jobId,
      status: "pending",
      createdAt,
      totalDays: days,
      progress: 0,
    };

    /* Persist job to Redis (TTL: 48 hours) */
    const redis = getRedis();
    if (redis) {
      await redis.set(`mpasi:job:${jobId}`, JSON.stringify(job), { ex: 172800 });
    }

    /* Persist job to Supabase job_queue if configured */
    if (isSupabaseConfigured()) {
      await supabase.from("job_queue").insert({
        id: jobId,
        job_type: "weekly_plan",
        status: "pending",
        payload: { ...body, days },
        created_at: createdAt,
      });
    }

    /* Enqueue to QStash for background processing */
    const qstashToken = process.env.QSTASH_TOKEN;
    if (qstashToken) {
      const qstash = new Client({ token: qstashToken });
      const baseUrl =
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      await qstash.publishJSON({
        url: `${baseUrl}/api/weekly-plan/process`,
        body: { jobId, request: body, days },
        retries: 2,
        delay: 0,
      });
    } else {
      // Fallback: process synchronously in development (no QStash configured)
      console.warn(
        "[weekly-plan] QSTASH_TOKEN not set — job queued in Redis but NOT processed. Set QSTASH_TOKEN to enable background processing."
      );
    }

    return NextResponse.json(
      {
        jobId,
        status: "pending",
        totalDays: days,
        createdAt,
        pollUrl: `/api/weekly-plan/${jobId}`,
        message: `Jadwal ${days} hari sedang digenerate. Poll pollUrl setiap 3 detik untuk melihat progres.`,
      },
      { status: 202 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[weekly-plan POST] Unhandled:", message);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
