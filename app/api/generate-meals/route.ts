import { NextRequest } from "next/server";
import Groq from "groq-sdk";

/* ── Types ────────────────────────────────────────────── */
export interface MealEntry {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  nutritionHighlight: string;
}

export interface MealMatrix {
  breakfast: MealEntry;
  am_snack: MealEntry;
  lunch: MealEntry;
  pm_snack: MealEntry;
  dinner: MealEntry;
  generatedAt: string;
  fridgeIngredients: string[];
}

/* ── System Prompt ────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a pediatric nutritionist and chef for a 16-month-old toddler. The child eats finely chopped family food.

Return a valid JSON object containing a 5-Meal Matrix with keys: breakfast, am_snack, lunch, pm_snack, dinner.

Each meal object must have these exact fields:
- "name": string (creative dish name in Bahasa Indonesia)
- "description": string (1-2 sentence description in Bahasa Indonesia)
- "ingredients": string[] (specific ingredients with quantities)
- "instructions": string[] (step-by-step cooking instructions in Bahasa Indonesia, max 5 steps)
- "cookingTime": number (total prep + cook time in minutes as integer)
- "nutritionHighlight": string (key nutritional benefit in Bahasa Indonesia, 1 sentence)

STRICT CONSTRAINTS:
1. Breakfast "cookingTime" MUST be 30 minutes or less — hard limit for a working mother at 5:30 AM.
2. Use ONLY the provided fridge ingredients plus basic pantry staples: garam, gula, minyak sayur, bawang putih, bawang merah, kecap manis, tepung terigu, nasi putih, air.
3. All textures must be safe for a 16-month-old: finely chopped, soft, low sodium, NOT spicy.
4. Vary protein sources across all 5 meals for balanced nutrition.
5. Include at least one vegetable in breakfast, lunch, and dinner.
6. Return ONLY valid raw JSON. Do NOT use markdown code fences. Start with { and end with }.`;

/* ── Helpers ──────────────────────────────────────────── */
function stripMarkdownFences(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  }
  return text.trim();
}

/* ── POST Handler ─────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    /* 1. Parse request body */
    const body = await request.json();
    const ingredients: string[] = body.ingredients ?? [];

    if (!ingredients.length) {
      return Response.json(
        { error: "Minimal 1 bahan harus diisi." },
        { status: 400 }
      );
    }

    /* 2. Validate API key */
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Konfigurasi server bermasalah. GROQ_API_KEY belum diisi." },
        { status: 500 }
      );
    }

    /* 3. Build user prompt */
    const userPrompt = `Bahan-bahan di kulkasku saat ini:
${ingredients.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Buatkan matrix 5 meal MPASI untuk besok. Kembalikan hanya JSON yang valid.`;

    /* 4. Call Groq API (LLaMA 3.3 70B — fast & free) */
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    if (!rawText) {
      return Response.json(
        { error: "AI tidak menghasilkan respons. Coba lagi." },
        { status: 502 }
      );
    }

    /* 5. Parse JSON */
    const cleanText = stripMarkdownFences(rawText);
    let parsed: Record<string, MealEntry>;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("[generate-meals] JSON parse error:", cleanText.slice(0, 300));
      return Response.json(
        { error: "AI menghasilkan format tidak valid. Coba lagi." },
        { status: 502 }
      );
    }

    /* 6. Validate required keys */
    const requiredKeys = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"];
    const missing = requiredKeys.filter((k) => !(k in parsed));
    if (missing.length) {
      return Response.json(
        { error: `Respons AI tidak lengkap (missing: ${missing.join(", ")}). Coba lagi.` },
        { status: 502 }
      );
    }

    /* 7. Return meal matrix */
    const matrix: MealMatrix = {
      breakfast: parsed.breakfast,
      am_snack:  parsed.am_snack,
      lunch:     parsed.lunch,
      pm_snack:  parsed.pm_snack,
      dinner:    parsed.dinner,
      generatedAt: new Date().toISOString(),
      fridgeIngredients: ingredients,
    };

    return Response.json({ matrix }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-meals] Unhandled:", message);
    return Response.json(
      { error: "Terjadi kesalahan tidak terduga. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
