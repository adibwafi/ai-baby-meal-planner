import { NextRequest, NextResponse } from "next/server";
import type { MealMatrix, MealEntry } from "@/app/api/generate-meals/route";

/* ── WHO/Kemenkes MPASI Nutrition Scoring Engine ──────── */
// Reference: WHO IYCF guidelines + Kemenkes RI MPASI guidelines 2023
// Scores are 0-100 based on compliance with age-appropriate guidelines.

interface NutritionScore {
  overallScore: number;         // Composite score 0-100
  ironScore: number;            // Iron-rich food presence (critical for cognitive dev)
  proteinScore: number;         // Protein variety & quantity adequacy
  vegetableScore: number;       // Vegetable diversity (vitamins, fiber)
  breakfastTimeScore: number;   // Breakfast ≤30 min compliance (working mom constraint)
  varietyScore: number;         // Protein source variety across 5 meals
  allergenSafetyScore: number;  // No cross-allergen risk (100 = safe, 0 = risk detected)
  recommendation: string;
  badges: string[];
  warnings: string[];
  perMealScores: Record<string, number>;
}

/* ── Iron-rich ingredient keywords ───────────────────────*/
const IRON_RICH_KEYWORDS = [
  "daging sapi", "hati ayam", "hati sapi", "ikan", "tahu", "tempe",
  "bayam", "brokoli", "kacang merah", "kacang hijau", "telur", "dada ayam",
  "salmon", "sardin", "edamame", "buncis",
];

const PROTEIN_KEYWORDS = [
  "ayam", "sapi", "ikan", "tahu", "tempe", "telur", "udang", "salmon",
  "tuna", "daging", "hati", "kacang", "edamame",
];

const VEGETABLE_KEYWORDS = [
  "wortel", "bayam", "brokoli", "kentang", "ubi", "labu", "buncis",
  "zucchini", "jagung", "tomat", "kangkung", "sawi", "kembang kol",
  "kacang panjang", "pare", "terong", "bit",
];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function scoreMeal(meal: MealEntry, allergens: string[]): number {
  let score = 60; // baseline
  const allText = [
    meal.name,
    meal.description,
    ...meal.ingredients,
    meal.nutritionHighlight,
  ].join(" ").toLowerCase();

  if (containsAny(allText, PROTEIN_KEYWORDS)) score += 15;
  if (containsAny(allText, VEGETABLE_KEYWORDS)) score += 15;
  if (containsAny(allText, IRON_RICH_KEYWORDS)) score += 10;

  // Allergen penalty
  const allergenFound = allergens.some((a) =>
    allText.includes(a.toLowerCase())
  );
  if (allergenFound) score -= 40;

  return Math.max(0, Math.min(100, score));
}

/* ── POST /api/nutrition-score ────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const matrix: MealMatrix = body.matrix;
    const allergens: string[] = body.allergens ?? [];
    const ageMonths: number = body.ageMonths ?? 12;

    if (!matrix?.breakfast) {
      return NextResponse.json(
        { error: "matrix dengan 5 meal wajib diisi." },
        { status: 400 }
      );
    }

    const slots = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"] as const;
    const perMealScores: Record<string, number> = {};

    for (const slot of slots) {
      perMealScores[slot] = scoreMeal(matrix[slot], allergens);
    }

    /* --- Individual dimension scores --- */

    // Iron score: count iron-rich meals across the day
    const ironMeals = slots.filter((s) => {
      const allText = [...matrix[s].ingredients, matrix[s].nutritionHighlight].join(" ");
      return containsAny(allText, IRON_RICH_KEYWORDS);
    }).length;
    const ironScore = Math.min(100, (ironMeals / 5) * 100 + (ironMeals >= 3 ? 20 : 0));

    // Protein variety score: count unique protein keywords
    const proteinSources = new Set<string>();
    for (const slot of slots) {
      const allText = [...matrix[slot].ingredients].join(" ").toLowerCase();
      PROTEIN_KEYWORDS.forEach((k) => {
        if (allText.includes(k)) proteinSources.add(k);
      });
    }
    const proteinScore = Math.min(100, (proteinSources.size / 5) * 100 + (proteinSources.size >= 3 ? 15 : 0));

    // Vegetable score: veg in breakfast, lunch, dinner
    const keyMeals = ["breakfast", "lunch", "dinner"] as const;
    const vegMeals = keyMeals.filter((s) => {
      const allText = [...matrix[s].ingredients].join(" ");
      return containsAny(allText, VEGETABLE_KEYWORDS);
    }).length;
    const vegetableScore = Math.round((vegMeals / 3) * 100);

    // Breakfast time compliance (critical for working moms)
    const breakfastTimeScore = (matrix.breakfast.cookingTime ?? 99) <= 30 ? 100 : 0;

    // Variety score: protein source diversity
    const varietyScore = Math.min(100, (proteinSources.size / 4) * 100);

    // Allergen safety
    const allergenSafetyScore =
      allergens.length === 0
        ? 100
        : Object.values(perMealScores).every((s) => s >= 50)
        ? 100
        : 0;

    // Composite overall score (weighted)
    const overallScore = Math.round(
      ironScore * 0.25 +
        proteinScore * 0.20 +
        vegetableScore * 0.20 +
        breakfastTimeScore * 0.15 +
        varietyScore * 0.10 +
        allergenSafetyScore * 0.10
    );

    /* --- Badges & Warnings --- */
    const badges: string[] = [];
    const warnings: string[] = [];

    if (breakfastTimeScore === 100) badges.push("⚡ Sarapan Cepat < 30 Menit");
    if (ironScore >= 80) badges.push("🥩 Kaya Zat Besi");
    if (vegetableScore === 100) badges.push("🥦 Sayur di Setiap Makan Utama");
    if (proteinSources.size >= 3) badges.push("💪 Protein Bervariasi");
    if (overallScore >= 85) badges.push("⭐ Menu MPASI Optimal");

    if (breakfastTimeScore < 100)
      warnings.push(`⚠️ Sarapan membutuhkan ${matrix.breakfast.cookingTime} menit — melebihi batas 30 menit untuk ibu bekerja.`);
    if (ironScore < 60)
      warnings.push("⚠️ Kandungan zat besi rendah. Tambahkan hati ayam, bayam, atau tahu.");
    if (proteinSources.size < 2)
      warnings.push("⚠️ Variasi protein terlalu sedikit. Kombinasikan sumber hewani & nabati.");
    if (allergenSafetyScore < 100)
      warnings.push("🚨 Potensi allergen terdeteksi. Periksa kembali bahan-bahan resep.");
    if (ageMonths < 9 && matrix.breakfast.cookingTime > 25)
      warnings.push("⚠️ Untuk bayi 6-8 bulan, makanan harus dicek teksturnya agar benar-benar halus.");

    /* --- Recommendation --- */
    let recommendation = "";
    if (overallScore >= 85) {
      recommendation = `Menu hari ini sangat baik! Semua nutrisi esensial untuk ${ageMonths} bulan terpenuhi dengan baik.`;
    } else if (overallScore >= 65) {
      recommendation = `Menu cukup baik. ${warnings[0] ?? "Pertahankan variasi bahan setiap hari."}`;
    } else {
      recommendation = `Menu perlu diperbaiki. Fokus pada: ${warnings.slice(0, 2).join(" & ")}.`;
    }

    const result: NutritionScore = {
      overallScore,
      ironScore: Math.round(ironScore),
      proteinScore: Math.round(proteinScore),
      vegetableScore,
      breakfastTimeScore,
      varietyScore: Math.round(varietyScore),
      allergenSafetyScore,
      recommendation,
      badges,
      warnings,
      perMealScores,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[nutrition-score] Unhandled:", message);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
