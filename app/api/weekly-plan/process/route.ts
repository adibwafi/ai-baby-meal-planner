import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { MealEntry, MealMatrix } from "@/app/api/generate-meals/route";

/* ── Redis client ─────────────────────────────────────── */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function buildCacheKey(
  ingredients: string[],
  ageMonths: number,
  allergies: string[]
): string {
  const normalized = {
    ingredients: [...ingredients].map((i) => i.toLowerCase().trim()).sort(),
    ageMonths,
    allergies: [...allergies].map((a) => a.toLowerCase().trim()).sort(),
  };
  const hash = createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex")
    .slice(0, 16);
  return `mpasi:meals:${ageMonths}m:${hash}`;
}

function stripMarkdownFences(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
  }
  return text.trim();
}

function getSystemPrompt(ageMonths: number): string {
  let textureGuide = "";
  let ageRangeText = "";

  if (ageMonths >= 6 && ageMonths <= 8) {
    ageRangeText = "bayi usia 6-8 bulan";
    textureGuide = `Texture: Puree Halus / Bubur Saring. No salt, sugar, or honey. Basic allergen-safe foods only.`;
  } else if (ageMonths >= 9 && ageMonths <= 11) {
    ageRangeText = "bayi usia 9-11 bulan";
    textureGuide = `Texture: Bubur Kasar / Mashed. Very low sodium. Fork-mashed or coarsely chopped.`;
  } else {
    ageRangeText = `balita usia ${ageMonths} bulan`;
    textureGuide = `Texture: Soft Table Food. Low sodium, low sugar, no spice.`;
  }

  return `You are a pediatric nutritionist for MPASI for a ${ageRangeText}.
Return valid JSON with keys: breakfast, am_snack, lunch, pm_snack, dinner.
Each meal: name, description, ingredients[], instructions[] (max 4 steps), cookingTime (int), nutritionHighlight, portionSize.
RULES: Breakfast ≤30 min. ${textureGuide}. Vary protein. Include veg in breakfast/lunch/dinner.
Return ONLY raw JSON starting with { and ending with }.`;
}

/* ── Groq call for a single day ───────────────────────── */
async function generateOneDayMeals(
  groq: Groq,
  redis: Redis | null,
  ingredients: string[],
  childName: string,
  childAgeMonths: number,
  allergies: string[],
  dayIndex: number
): Promise<MealMatrix> {
  // Check Redis cache first
  const cacheKey = buildCacheKey(ingredients, childAgeMonths, allergies);
  if (redis) {
    try {
      const cached = await redis.get<{ matrix: MealMatrix }>(cacheKey);
      if (cached?.matrix) return { ...cached.matrix, cacheHit: true };
    } catch { /* non-fatal */ }
  }

  const allergyRules =
    allergies.length > 0
      ? `CRITICAL: Child ALLERGIC to: ${allergies.join(", ")}. EXCLUDE from all recipes.`
      : "";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `${getSystemPrompt(childAgeMonths)}\n${allergyRules}\nChild name: ${childName}.`,
      },
      {
        role: "user",
        content: `Hari ke-${dayIndex + 1}. Bahan kulkas:\n${ingredients
          .map((i, n) => `${n + 1}. ${i}`)
          .join("\n")}\n\nBuat matrix 5 meal MPASI untuk ${childName}. JSON only.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const rawText = completion.choices[0]?.message?.content ?? "";
  const parsed: Record<string, MealEntry> = JSON.parse(stripMarkdownFences(rawText));

  const matrix: MealMatrix = {
    breakfast: parsed.breakfast,
    am_snack: parsed.am_snack,
    lunch: parsed.lunch,
    pm_snack: parsed.pm_snack,
    dinner: parsed.dinner,
    generatedAt: new Date().toISOString(),
    fridgeIngredients: ingredients,
    cacheHit: false,
  };

  // Store in cache
  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify({ matrix, cachedAt: matrix.generatedAt }), { ex: 86400 });
    } catch { /* non-fatal */ }
  }

  return matrix;
}

/* ── QStash webhook handler ───────────────────────────── */
// This route is called by QStash in the background.
// Signature verification ensures only QStash can call this endpoint.
async function handler(request: NextRequest) {
  const body = await request.json();
  const { jobId, request: jobRequest, days } = body as {
    jobId: string;
    request: {
      childName: string;
      childAgeMonths: number;
      allergies: string[];
      ingredientsByDay: string[][];
      childId?: string;
    };
    days: number;
  };

  const redis = getRedis();
  const apiKey = process.env.GROQ_API_KEY;

  const updateJobStatus = async (
    status: string,
    progress?: number,
    result?: unknown,
    errorMsg?: string
  ) => {
    const update: Record<string, unknown> = { status };
    if (progress !== undefined) update.progress = progress;
    if (result !== undefined) update.result = result;
    if (errorMsg !== undefined) update.error = errorMsg;
    if (status === "done" || status === "failed") {
      update.completedAt = new Date().toISOString();
    }

    // Update Redis
    if (redis) {
      try {
        const existing = await redis.get<Record<string, unknown>>(`mpasi:job:${jobId}`);
        if (existing) {
          await redis.set(`mpasi:job:${jobId}`, JSON.stringify({ ...existing, ...update }), { ex: 172800 });
        }
      } catch { /* non-fatal */ }
    }

    // Update Supabase
    if (isSupabaseConfigured()) {
      const dbUpdate: Record<string, unknown> = { status };
      if (progress !== undefined) dbUpdate.progress = progress;
      if (result !== undefined) dbUpdate.result = result;
      if (errorMsg !== undefined) dbUpdate.error_message = errorMsg;
      if (status === "done" || status === "failed") {
        dbUpdate.completed_at = new Date().toISOString();
      }
      await supabase.from("job_queue").update(dbUpdate).eq("id", jobId);
    }
  };

  try {
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");
    const groq = new Groq({ apiKey });

    await updateJobStatus("processing", 0);

    const results: MealMatrix[] = [];
    const actualDays = Math.min(days, jobRequest.ingredientsByDay.length, 7);

    for (let i = 0; i < actualDays; i++) {
      const dayIngredients = jobRequest.ingredientsByDay[i] ?? [];
      if (!dayIngredients.length) continue;

      const matrix = await generateOneDayMeals(
        groq,
        redis,
        dayIngredients,
        jobRequest.childName,
        jobRequest.childAgeMonths,
        jobRequest.allergies ?? [],
        i
      );
      results.push(matrix);
      await updateJobStatus("processing", i + 1);

      // Persist each day's meals to Supabase meal_entries if configured
      if (isSupabaseConfigured() && jobRequest.childId) {
        const mealDate = new Date();
        mealDate.setDate(mealDate.getDate() + i + 1);
        const dateStr = mealDate.toISOString().split("T")[0];

        const slots = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"] as const;
        const entries = slots.map((slot) => ({
          child_id: jobRequest.childId,
          meal_date: dateStr,
          meal_slot: slot,
          name: matrix[slot].name,
          description: matrix[slot].description,
          ingredients: matrix[slot].ingredients,
          instructions: matrix[slot].instructions,
          cooking_time_minutes: matrix[slot].cookingTime,
          portion_size: matrix[slot].portionSize,
          nutrition_highlight: matrix[slot].nutritionHighlight,
        }));
        await supabase.from("meal_entries").insert(entries);
      }
    }

    await updateJobStatus("done", actualDays, results);

    return NextResponse.json({ ok: true, jobId, totalProcessed: results.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[weekly-plan/process] Error:", msg);
    await updateJobStatus("failed", undefined, undefined, msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Wrap with QStash signature verification in production.
// Falls back to direct handler if QSTASH keys not configured (dev mode).
const qstashCurrentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
export const POST = qstashCurrentKey
  ? verifySignatureAppRouter(handler)
  : handler;
