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
/* ── System Prompt Generator ──────────────────────────────── */
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
    const childName: string = body.childName ?? "Anak";
    const allergies: string[] = body.allergies ?? [];
    const childAgeMonths: number = Number(body.childAgeMonths ?? 16);

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

    /* 3. Build user prompt & customized system prompt */
    const allergyRules = allergies.length > 0 
      ? `\nCRITICAL SAFETY CONSTRAINT: The child is ALLERGIC to: ${allergies.join(", ")}. Do NOT use these ingredients under any circumstances. Even if they are listed as available ingredients, EXCLUDE them from all recipes.` 
      : "";

    const dynamicSystemPrompt = `${getSystemPrompt(childAgeMonths)}${allergyRules}\nNote: The child's name is ${childName}. Make sure the recommendations fit.`;

    const userPrompt = `Bahan-bahan di kulkasku saat ini:
${ingredients.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Buatkan matrix 5 meal MPASI untuk ${childName} besok. Kembalikan hanya JSON yang valid.`;

    /* 4. Call Groq API (LLaMA 3.3 70B — fast & free) */
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: dynamicSystemPrompt },
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
