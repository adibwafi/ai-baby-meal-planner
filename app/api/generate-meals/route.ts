import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

/* ── Types ────────────────────────────────────────────── */
export interface MealEntry {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  nutritionHighlight: string;
  portionSize: string;
}

export interface MealMatrix {
  breakfast: MealEntry;
  am_snack: MealEntry;
  lunch: MealEntry;
  pm_snack: MealEntry;
  dinner: MealEntry;
  generatedAt: string;
  fridgeIngredients: string[];
  cacheHit?: boolean;
  cachedAt?: string;
}

/* ── Redis client (lazy init — safe if env vars missing) ─ */
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch {
    return null;
  }
}

/* ── Cache key generator ──────────────────────────────── */
// Deterministic hash: sorted ingredients + age + sorted allergies.
// Order of input doesn't affect cache key — same combo always hits same cache.
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
    .slice(0, 16); // First 16 chars = 64-bit collision resistance, short enough for Redis key
  return `mpasi:meals:${ageMonths}m:${hash}`;
}

/* ── System Prompt Generator ──────────────────────────── */
function getSystemPrompt(ageMonths: number): string {
  let textureGuide = "";
  let ageRangeText = "";

  if (ageMonths >= 6 && ageMonths <= 8) {
    ageRangeText = "bayi usia 6-8 bulan";
    textureGuide = `
STRICT PEDIATRIC NUTRITION RULES FOR 6-8 MONTHS:
- Texture MUST be "Puree Halus / Bubur Saring" (smooth puree, no lumps).
- Recipes must involve straining (saring), blending (blender), or mashing until very smooth.
- Absolutely NO added salt (garam), sugar (gula), or honey. Only use natural food flavors.
- Limit ingredients to basic allergen-safe foods.
`;
  } else if (ageMonths >= 9 && ageMonths <= 11) {
    ageRangeText = "bayi usia 9-11 bulan";
    textureGuide = `
STRICT PEDIATRIC NUTRITION RULES FOR 9-11 MONTHS:
- Texture MUST be "Bubur Kasar / Mashed / Nasi Tim Lumat" (lumpy texture to encourage chewing).
- Recipes should involve mashing with a fork or chopping coarsely (cincang kasar).
- Extremely low sodium (sangat sedikit garam, tidak menggunakan gula berlebih).
`;
  } else {
    ageRangeText = `balita usia ${ageMonths} bulan`;
    textureGuide = `
STRICT PEDIATRIC NUTRITION RULES FOR 12+ MONTHS:
- Texture MUST be "Makanan Keluarga Cincang Halus / Potongan Kecil (Soft Table Food)" (easy to chew, bite-sized pieces).
- Low sodium, low sugar, NOT spicy at all.
`;
  }

  return `You are a pediatric nutritionist and chef specializing in MPASI (Makanan Pendamping ASI) for a ${ageRangeText}.

Return a valid JSON object containing a 5-Meal Matrix with keys: breakfast, am_snack, lunch, pm_snack, dinner.

Each meal object must have these exact fields:
- "name": string (creative dish name in Bahasa Indonesia)
- "description": string (1-2 sentence description in Bahasa Indonesia)
- "ingredients": string[] (specific ingredients with quantities)
- "instructions": string[] (step-by-step cooking instructions in Bahasa Indonesia, STRICTLY maximum 4 steps. Keep steps very short, clear, and direct. Start each step with a clear action verb like Potong, Rebus, Tumis, Kukus, Saring, Haluskan, or Sajikan)
- "cookingTime": number (total prep + cook time in minutes as integer)
- "nutritionHighlight": string (key nutritional benefit in Bahasa Indonesia, 1 sentence)
- "portionSize": string (recommended serving size for this child's age in Bahasa Indonesia, e.g. "2-3 sdm" for 6-8 months, "½ mangkuk / 150ml" for 9-11 months, "175-250ml" for 12+ months)

STRICT CONSTRAINTS:
1. Breakfast "cookingTime" MUST be 30 minutes or less — hard limit for a working mother at 5:30 AM.
2. Use ONLY the provided fridge ingredients plus basic pantry staples: garam, gula, minyak sayur, bawang putih, bawang merah, kecap manis, tepung terigu, nasi putih, air.
3. ${textureGuide}
4. Vary protein sources across all 5 meals for balanced nutrition.
5. Include at least one vegetable in breakfast, lunch, and dinner.
6. Return ONLY valid raw JSON. Do NOT use markdown code fences. Start with { and end with }.`;
}

/* ── Helpers ──────────────────────────────────────────── */
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

/* ── POST Handler ─────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    /* 1. Parse request body */
    const body = await request.json();
    const ingredients: string[] = body.ingredients ?? [];
    const childName: string = body.childName ?? "Anak";
    const allergies: string[] = body.allergies ?? [];
    const childAgeMonths: number = Number(body.childAgeMonths ?? 16);

    if (!ingredients.length) {
      return NextResponse.json(
        { error: "Minimal 1 bahan harus diisi." },
        { status: 400 }
      );
    }

    /* 2. Validate API key */
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Konfigurasi server bermasalah. GROQ_API_KEY belum diisi." },
        { status: 500 }
      );
    }

    /* 3. Check Redis cache ─────────────────────────────────
       Cache key is deterministic: sorted(ingredients) + age + sorted(allergies).
       TTL = 86400s (24 hours) — valid for one full day of MPASI planning.
       Cache is ingredient-level, not user-level (no PII stored in Redis).
    ──────────────────────────────────────────────────────── */
    const cacheKey = buildCacheKey(ingredients, childAgeMonths, allergies);
    const client = getRedis();
    let cacheHit = false;
    let cachedAt: string | undefined;

    if (client) {
      try {
        const cached = await client.get<{ matrix: MealMatrix; cachedAt: string }>(cacheKey);
        if (cached && cached.matrix) {
          const matrix: MealMatrix = {
            ...cached.matrix,
            generatedAt: cached.matrix.generatedAt,
            fridgeIngredients: ingredients,
            cacheHit: true,
            cachedAt: cached.cachedAt,
          };
          return NextResponse.json(
            { matrix },
            {
              status: 200,
              headers: {
                "X-Cache": "HIT",
                "X-Cache-Key": cacheKey,
                "Cache-Control": "no-store",
              },
            }
          );
        }
      } catch (cacheErr) {
        // Redis failure is non-fatal — fall through to Groq
        console.warn("[generate-meals] Redis GET failed (non-fatal):", cacheErr);
      }
    }

    /* 4. Build prompts */
    const allergyRules =
      allergies.length > 0
        ? `\nCRITICAL SAFETY CONSTRAINT: The child is ALLERGIC to: ${allergies.join(
            ", "
          )}. Do NOT use these ingredients under any circumstances. Even if they are listed as available ingredients, EXCLUDE them from all recipes.`
        : "";

    const dynamicSystemPrompt = `${getSystemPrompt(childAgeMonths)}${allergyRules}\nNote: The child's name is ${childName}. Make sure the recommendations fit.`;

    const userPrompt = `Bahan-bahan di kulkasku saat ini:\n${ingredients
      .map((i, idx) => `${idx + 1}. ${i}`)
      .join("\n")}\n\nBuatkan matrix 5 meal MPASI untuk ${childName} besok. Kembalikan hanya JSON yang valid.`;

    /* 5. Call Groq API */
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: dynamicSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText) {
      return NextResponse.json(
        { error: "AI tidak menghasilkan respons. Coba lagi." },
        { status: 502 }
      );
    }

    /* 6. Parse & validate JSON */
    const cleanText = stripMarkdownFences(rawText);
    let parsed: Record<string, MealEntry>;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("[generate-meals] JSON parse error:", cleanText.slice(0, 300));
      return NextResponse.json(
        { error: "AI menghasilkan format tidak valid. Coba lagi." },
        { status: 502 }
      );
    }

    const requiredKeys = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"];
    const missing = requiredKeys.filter((k) => !(k in parsed));
    if (missing.length) {
      return NextResponse.json(
        {
          error: `Respons AI tidak lengkap (missing: ${missing.join(", ")}). Coba lagi.`,
        },
        { status: 502 }
      );
    }

    /* 7. Build matrix */
    cachedAt = new Date().toISOString();
    const matrix: MealMatrix = {
      breakfast: parsed.breakfast,
      am_snack: parsed.am_snack,
      lunch: parsed.lunch,
      pm_snack: parsed.pm_snack,
      dinner: parsed.dinner,
      generatedAt: cachedAt,
      fridgeIngredients: ingredients,
      cacheHit,
    };

    /* 8. Store in Redis cache (TTL: 24 hours) ─────────────
       Key pattern: mpasi:meals:{ageMonths}m:{hash}
       Only the meal matrix is cached — no user PII.
    ──────────────────────────────────────────────────────── */
    if (client) {
      try {
        await client.set(
          cacheKey,
          JSON.stringify({ matrix, cachedAt }),
          { ex: 86400 } // 24 hours TTL
        );
      } catch (cacheErr) {
        console.warn("[generate-meals] Redis SET failed (non-fatal):", cacheErr);
      }
    }

    return NextResponse.json(
      { matrix },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "X-Cache-Key": cacheKey,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-meals] Unhandled:", message);
    return NextResponse.json(
      { error: "Terjadi kesalahan tidak terduga. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
