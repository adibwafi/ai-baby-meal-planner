import { NextRequest, NextResponse } from "next/server";
import type { MealMatrix } from "@/app/api/generate-meals/route";

/* ── Smart Shopping List Optimizer ───────────────────────
   Input: weekly plan (array of MealMatrix) + current fridge inventory
   Output: consolidated, deduplicated shopping list sorted by grocery section
   
   This demonstrates:
   - Set theory / array diffing (fridge vs. needed)
   - Grocery section categorization (domain knowledge)
   - Quantity aggregation across 7 days
   - Indonesian market price estimation (hardcoded averages)
────────────────────────────────────────────────────────── */

type GrocerySection =
  | "🥩 Protein Hewani"
  | "🌿 Sayuran"
  | "🍚 Karbohidrat"
  | "🥚 Protein Nabati & Telur"
  | "🧴 Bumbu & Minyak"
  | "🍼 Susu & Dairy"
  | "🛒 Lainnya";

interface ShoppingItem {
  name: string;
  section: GrocerySection;
  estimatedPriceIDR?: number;    // Average market price (Jabodetabek 2024)
  dayCount: number;              // How many days this ingredient appears
  isFromFridge: boolean;
}

interface ShoppingList {
  items: ShoppingItem[];
  bySection: Record<GrocerySection, ShoppingItem[]>;
  totalItems: number;
  estimatedTotalIDR: number;
  fridgeSavingsIDR: number;      // Money saved by using existing fridge items
  summary: string;
  whatsappText: string;
}

/* ── Grocery section classification ───────────────────── */
const SECTION_MAP: Record<string, GrocerySection> = {
  // Protein Hewani
  ayam: "🥩 Protein Hewani",
  "dada ayam": "🥩 Protein Hewani",
  "paha ayam": "🥩 Protein Hewani",
  "hati ayam": "🥩 Protein Hewani",
  "daging sapi": "🥩 Protein Hewani",
  ikan: "🥩 Protein Hewani",
  salmon: "🥩 Protein Hewani",
  tuna: "🥩 Protein Hewani",
  udang: "🥩 Protein Hewani",
  // Sayuran
  wortel: "🌿 Sayuran",
  bayam: "🌿 Sayuran",
  brokoli: "🌿 Sayuran",
  kentang: "🌿 Sayuran",
  labu: "🌿 Sayuran",
  buncis: "🌿 Sayuran",
  tomat: "🌿 Sayuran",
  jagung: "🌿 Sayuran",
  ubi: "🌿 Sayuran",
  zucchini: "🌿 Sayuran",
  sawi: "🌿 Sayuran",
  kangkung: "🌿 Sayuran",
  // Karbohidrat
  nasi: "🍚 Karbohidrat",
  beras: "🍚 Karbohidrat",
  oatmeal: "🍚 Karbohidrat",
  roti: "🍚 Karbohidrat",
  tepung: "🍚 Karbohidrat",
  makaroni: "🍚 Karbohidrat",
  pasta: "🍚 Karbohidrat",
  mie: "🍚 Karbohidrat",
  // Protein Nabati & Telur
  tahu: "🥚 Protein Nabati & Telur",
  tempe: "🥚 Protein Nabati & Telur",
  telur: "🥚 Protein Nabati & Telur",
  "kacang hijau": "🥚 Protein Nabati & Telur",
  "kacang merah": "🥚 Protein Nabati & Telur",
  edamame: "🥚 Protein Nabati & Telur",
  // Bumbu & Minyak
  "bawang putih": "🧴 Bumbu & Minyak",
  "bawang merah": "🧴 Bumbu & Minyak",
  minyak: "🧴 Bumbu & Minyak",
  garam: "🧴 Bumbu & Minyak",
  gula: "🧴 Bumbu & Minyak",
  kecap: "🧴 Bumbu & Minyak",
  // Dairy
  susu: "🍼 Susu & Dairy",
  keju: "🍼 Susu & Dairy",
  yogurt: "🍼 Susu & Dairy",
  mentega: "🍼 Susu & Dairy",
};

/* ── Estimated prices (IDR, Jabodetabek 2024 avg) ─────── */
const PRICE_MAP: Record<string, number> = {
  "dada ayam": 35000,
  "hati ayam": 15000,
  "daging sapi": 120000,
  ikan: 30000,
  salmon: 80000,
  tuna: 25000,
  telur: 28000,
  tahu: 5000,
  tempe: 5000,
  wortel: 8000,
  bayam: 5000,
  brokoli: 15000,
  kentang: 12000,
  labu: 8000,
  "kacang hijau": 20000,
  "kacang merah": 22000,
  beras: 14000,
  oatmeal: 30000,
  susu: 20000,
};

function classifyIngredient(ingredient: string): GrocerySection {
  const lower = ingredient.toLowerCase();
  for (const [keyword, section] of Object.entries(SECTION_MAP)) {
    if (lower.includes(keyword)) return section;
  }
  return "🛒 Lainnya";
}

function estimatePrice(ingredient: string): number | undefined {
  const lower = ingredient.toLowerCase();
  for (const [keyword, price] of Object.entries(PRICE_MAP)) {
    if (lower.includes(keyword)) return price;
  }
  return undefined;
}

function cleanIngredientName(raw: string): string {
  // Strip quantities like "100g", "2 sdm", "3 lembar", etc.
  return raw
    .replace(/^\d+[\s,./]*(gram|g|kg|sdm|sdt|ml|L|lembar|siung|buah|buah|biji|mangkuk|cup|pcs|potong|iris|helai)?\s*/i, "")
    .trim()
    .toLowerCase();
}

/* ── POST /api/shopping-optimize ─────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const weeklyPlan: MealMatrix[] = body.weeklyPlan ?? [];
    const currentFridge: string[] = (body.currentFridge ?? []).map((i: string) =>
      i.toLowerCase().trim()
    );

    if (!weeklyPlan.length) {
      return NextResponse.json(
        { error: "weeklyPlan array wajib diisi." },
        { status: 400 }
      );
    }

    /* --- Collect all needed ingredients --- */
    const ingredientDayCount: Map<string, number> = new Map();

    for (const dayMatrix of weeklyPlan) {
      const slots = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"] as const;
      const dayIngredients = new Set<string>();

      for (const slot of slots) {
        const meal = dayMatrix[slot];
        if (!meal?.ingredients) continue;
        for (const raw of meal.ingredients) {
          const cleaned = cleanIngredientName(raw);
          if (cleaned.length > 1) dayIngredients.add(cleaned);
        }
      }

      dayIngredients.forEach((ing) => {
        ingredientDayCount.set(ing, (ingredientDayCount.get(ing) ?? 0) + 1);
      });
    }

    /* --- Diff against fridge (pantry staples excluded) --- */
    const PANTRY_STAPLES = new Set([
      "garam", "gula", "minyak sayur", "minyak", "bawang putih", "bawang merah",
      "kecap manis", "kecap", "tepung terigu", "tepung", "nasi putih", "nasi", "air",
    ]);

    const items: ShoppingItem[] = [];
    let estimatedTotalIDR = 0;
    let fridgeSavingsIDR = 0;

    ingredientDayCount.forEach((dayCount, ingredient) => {
      if (PANTRY_STAPLES.has(ingredient)) return;

      const isFromFridge = currentFridge.some(
        (f) => f.includes(ingredient) || ingredient.includes(f)
      );
      const section = classifyIngredient(ingredient);
      const price = estimatePrice(ingredient);

      if (isFromFridge && price) {
        fridgeSavingsIDR += price;
      }
      if (!isFromFridge && price) {
        estimatedTotalIDR += price;
      }

      items.push({
        name: ingredient,
        section,
        estimatedPriceIDR: price,
        dayCount,
        isFromFridge,
      });
    });

    /* --- Sort by section then by dayCount (most needed first) --- */
    const SECTION_ORDER: GrocerySection[] = [
      "🥩 Protein Hewani",
      "🌿 Sayuran",
      "🍚 Karbohidrat",
      "🥚 Protein Nabati & Telur",
      "🧴 Bumbu & Minyak",
      "🍼 Susu & Dairy",
      "🛒 Lainnya",
    ];
    items.sort(
      (a, b) =>
        SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) ||
        b.dayCount - a.dayCount
    );

    /* --- Group by section --- */
    const bySection: Partial<Record<GrocerySection, ShoppingItem[]>> = {};
    items.forEach((item) => {
      if (!bySection[item.section]) bySection[item.section] = [];
      bySection[item.section]!.push(item);
    });

    /* --- WhatsApp formatted text --- */
    const needToBuy = items.filter((i) => !i.isFromFridge);
    const whatsappLines = ["🛒 *Belanja MPASI Minggu Ini*\n"];
    let currentSection = "";
    needToBuy.forEach((item) => {
      if (item.section !== currentSection) {
        whatsappLines.push(`\n*${item.section}*`);
        currentSection = item.section;
      }
      const priceStr = item.estimatedPriceIDR
        ? ` (~Rp${(item.estimatedPriceIDR / 1000).toFixed(0)}rb)`
        : "";
      whatsappLines.push(`☐ ${item.name}${priceStr}`);
    });
    if (estimatedTotalIDR > 0) {
      whatsappLines.push(
        `\n💰 *Estimasi Total: Rp${estimatedTotalIDR.toLocaleString("id-ID")}*`
      );
      whatsappLines.push(
        `✅ Hemat ~Rp${fridgeSavingsIDR.toLocaleString("id-ID")} dari stok kulkas`
      );
    }

    const summary = needToBuy.length === 0
      ? "Kulkas sudah lengkap! Semua bahan tersedia untuk seminggu."
      : `Perlu beli ${needToBuy.length} bahan. Estimasi belanja: Rp${estimatedTotalIDR.toLocaleString("id-ID")}.`;

    const result: ShoppingList = {
      items,
      bySection: bySection as Record<GrocerySection, ShoppingItem[]>,
      totalItems: needToBuy.length,
      estimatedTotalIDR,
      fridgeSavingsIDR,
      summary,
      whatsappText: whatsappLines.join("\n"),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[shopping-optimize] Unhandled:", message);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
