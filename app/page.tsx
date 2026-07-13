"use client";

import { useState, useEffect } from "react";
import type { MealMatrix, MealEntry } from "./api/generate-meals/route";
import { supabase } from "../lib/supabase";

/* ─── SVG Icon Components ──────────────────── */
const IconHome = ({ size = 22, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const IconHeart = ({ size = 22, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconSettings = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconSpark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
  </svg>
);

const IconFridge = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="4" y1="10" x2="20" y2="10" />
    <line x1="9" y1="6" x2="9" y2="8" />
    <line x1="9" y1="14" x2="9" y2="18" />
  </svg>
);

const IconClock = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const IconClose = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPlus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconChevron = ({ size = 16, open = false }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const IconRefresh = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,4 23,10 17,10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconFolder = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconTikTok = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-1.1-1.02-1.7-2.48-1.78-3.99-.01 2.37 0 7.86 0 10.22-.05 1.56-.5 3.19-1.54 4.38-1.45 1.71-3.92 2.5-6.11 2.37-2.31-.08-4.73-1.22-5.83-3.29-1.28-2.28-1.07-5.46.73-7.5 1.4-1.67 3.8-2.51 5.96-2.2v4.21c-1.12-.13-2.35.21-3.03 1.14-.73.91-.7 2.32-.01 3.23.63.92 1.83 1.34 2.91 1.22.99-.07 1.9-.8 2.12-1.77.22-.84.14-11.96.14-14.73z"/>
  </svg>
);

/* ─── Global Translation Dictionary ────────── */
const TRANSLATIONS = {
  id: {
    greeting: "Ibu",
    title: "Smart Fridge",
    subtitle: "Rencanakan 5 menu MPASI besok berdasarkan bahan kulkas Anda dalam hitungan detik. Tanpa pusing scrolling resep media sosial.",
    
    /* Hero Section Copywriting */
    heroHeadline: "Siapkan MPASI Padat Nutrisi di Waktu Subuh, Tanpa Bingung.",
    heroSubheadline: "Optimalkan sisa bahan di kulkas secara instan. Dirancang khusus sesuai usia dan tahap tumbuh kembang si kecil.",
    heroPrimaryCTA: "Buat Rekomendasi Menu Subuh Ini",
    heroSecondaryCTA: "Periksa Isi Kulkas",
    
    /* Feature/Dashboard Components */
    ageSelectorTitle: "Pilih Kelompok Usia Bayi",
    activeInventoryLabel: "Stok Bahan Kulkas Tersedia",
    aiOutputCardHeader: "Rekomendasi Menu Pintar Pagi Ini",
    prepTimeBadge: "⏱️ 15 Menit Siap Saji",

    fridgeHeader: "Stok Bahan Kulkas Tersedia",
    fridgeEmpty: "Kulkas kosong. Tambahkan bahan makanan di bawah...",
    fridgePlaceholder: "Ketik bahan kulkas (contoh: Dada Ayam, Wortel)...",
    suggestHeader: "Cepat tambah:",
    btnGenerate: "Buat Rekomendasi Menu Subuh Ini",
    btnGenerating: "AI sedang menyusun resep...",
    btnRegenerate: "Rencanakan Ulang Menu",
    matrixHeader: "Rencana Menu 5 Kali Makan Besok",
    statusWaiting: "Menunggu AI",
    statusGenerated: "✓ Rencana Siap",
    resepBahan: "Bahan-bahan",
    resepInstruksi: "Cara Memasak",
    btnExpandShow: "Lihat Resep Detail",
    btnExpandHide: "Sembunyikan Detail",
    btnCook: "Mulai Masak (Mode Visual)",
    cookingStep: "Langkah",
    cookingOf: "dari",
    cookingBack: "Kembali",
    cookingNext: "Lanjut",
    cookingDone: "Selesai",
    cookingSuccessTitle: "MPASI Siap Disajikan! 🎉",
    cookingSuccessDesc: "Kerja bagus, Pa/Ma! MPASI sehat buatan sendiri siap disajikan untuk {childName}. Semoga lahap dan tumbuh sehat!",
    cookingClose: "Tutup Panduan Masak",
    navHome: "Beranda",
    navFav: "Favorit",
    navSetting: "Profil",
    settTitle: "Profil & Preferensi",
    settSub: "Atur nama anak, usia, dan bahan yang dihindari untuk resep yang lebih personal.",
    settChildHeader: "Profil Anak 👶",
    settNameLabel: "Nama Panggilan Anak",
    settAgeLabel: "Usia Anak (Bulan)",
    settAllergenLabel: "Alergen / Bahan yang Dihindari",
    settAllergenPlaceholder: "Ketik alergen (contoh: Udang, Susu Sapi)",
    settAllergenAdd: "Tambah",
    settAllergenEmpty: "Tidak ada alergen terdaftar.",
    settDbHeader: "Penyimpanan Cloud",
    settDbStatus: "Status Database Supabase",
    settDbConnected: "Tersambung (Cloud)",
    settDbFallback: "Lokal (Offline)",
    settDbDescConnected: "Bahan makanan dan koleksi resep favorit disimpan secara aman di database cloud Supabase Anda.",
    settDbDescLocal: "Koneksi database cloud belum terkonfigurasi. Data akan disimpan otomatis di memori browser (localStorage) Anda.",
    favTitle: "Koleksi Favorit",
    favSub: "Simpan dan kelompokkan resep-resep sehat yang paling disukai anak ke dalam folder terpisah.",
    favFolderCreate: "Buat Folder Baru",
    favFolderPlaceholder: "Nama folder (contoh: Menu Weekend, Anti GTM)",
    favFolderEmpty: "Belum ada resep yang disimpan di folder ini.",
    modalSaveTitle: "Pilih Folder Koleksi",
    modalSaveDesc: "Simpan resep ke folder:",
    modalSaveConfirm: "Simpan",
    badgeTexturePuree: "Saring Halus (6-8 bulan)",
    badgeTextureMashed: "Bubur Kasar / Lumat (9-11 bulan)",
    badgeTextureFamily: "Makanan Keluarga Cincang (12+ bulan)",
    texturePuree: "🥣 Rekomendasi Tekstur: Puree Halus / Saring (Usia 6-8 bulan)",
    textureMashed: "🥔 Rekomendasi Tekstur: Bubur Kasar / Lumat (Usia 9-11 bulan)",
    textureFamily: "🍽️ Rekomendasi Tekstur: Makanan Keluarga Cincang (Usia 12+ bulan)",
    pantryStaples: "ditambah bahan dapur dasar secara otomatis.",
    portionLabel: "Porsi",
    milestoneTitle: "Tahap Tumbuh Kembang",
    shoppingListTitle: "Daftar Belanja",
    shoppingListDesc: "Bahan berikut dibutuhkan untuk besok namun belum ada di kulkas:",
    shoppingListEmpty: "Semua bahan sudah tersedia di kulkas! 🎉",
    shoppingListCopy: "Salin Daftar",
    shoppingListCopied: "Tersalin! ✓",
    shoppingListShare: "Bagikan ke WhatsApp",
    historyTitle: "Riwayat Menu (7 Hari)",
    historyEmpty: "Belum ada riwayat menu sebelumnya.",
    historyLoad: "Muat Menu Ini"
  },
  en: {
    greeting: "Mom",
    title: "Smart Fridge",
    subtitle: "Plan 5 infant meals for tomorrow based on your fridge ingredients instantly. Stop scrolling social media for ideas.",
    
    /* Hero Section Copywriting */
    heroHeadline: "Nutritious MPASI, Made Effortless at Dawn.",
    heroSubheadline: "Optimize your fridge ingredients instantly. Tailored precisely to your baby’s age and developmental stage.",
    heroPrimaryCTA: "Generate Today's Dawn Recipe",
    heroSecondaryCTA: "Check Fridge Inventory",

    /* Feature/Dashboard Components */
    ageSelectorTitle: "Select Baby's Age Group",
    activeInventoryLabel: "Current Fridge Stock",
    aiOutputCardHeader: "Your Morning Smart Recipe",
    prepTimeBadge: "⏱️ 15-Min Quick Prep",

    fridgeHeader: "Current Fridge Stock",
    fridgeEmpty: "No ingredients yet. Add ingredients below...",
    fridgePlaceholder: "Type ingredient, then press Enter...",
    suggestHeader: "Quick add:",
    btnGenerate: "Generate Today's Dawn Recipe",
    btnGenerating: "AI is planning...",
    btnRegenerate: "Re-generate Meal Plan",
    matrixHeader: "5-Meal Daily Matrix",
    statusWaiting: "Awaiting AI",
    statusGenerated: "✓ AI Generated",
    resepBahan: "Ingredients",
    resepInstruksi: "Cooking Steps",
    btnExpandShow: "Show Recipe Detail",
    btnExpandHide: "Hide Recipe Detail",
    btnCook: "Start Cooking (Visual Mode)",
    cookingStep: "Step",
    cookingOf: "of",
    cookingBack: "Back",
    cookingNext: "Next",
    cookingDone: "Done",
    cookingSuccessTitle: "Meal Ready to Serve! 🎉",
    cookingSuccessDesc: "Great job! Your healthy homemade baby food is ready for {childName}. Hopefully they love it and grow healthy!",
    cookingClose: "Close Cooking Guide",
    navHome: "Home",
    navFav: "Favorites",
    navSetting: "Profile",
    settTitle: "Settings",
    settSub: "Configure child profile and allergens to customize recommendations.",
    settChildHeader: "Child Profile 👶",
    settNameLabel: "Child Nickname",
    settAgeLabel: "Child Age (Months)",
    settAllergenLabel: "Allergies / Avoided Ingredients",
    settAllergenPlaceholder: "Type allergen (e.g. Shrimp)",
    settAllergenAdd: "Add",
    settAllergenEmpty: "No allergens registered.",
    settDbHeader: "Database Storage",
    settDbStatus: "Supabase Connection Status",
    settDbConnected: "Connected (Cloud)",
    settDbFallback: "Fallback (Local/Offline)",
    settDbDescConnected: "Ingredients and favorite recipes are securely saved in your Supabase cloud database.",
    settDbDescLocal: "Supabase is not configured. Data is saved in browser storage (localStorage) for fully offline access.",
    favTitle: "Favorite Collections",
    favSub: "Organize baby food recipes you love into custom folders.",
    favFolderCreate: "Create New Folder",
    favFolderPlaceholder: "Folder name (e.g. Weekend Recipes)",
    favFolderEmpty: "No recipes saved in this folder yet.",
    modalSaveTitle: "Choose Collection Folder",
    modalSaveDesc: "Save recipe to folder:",
    modalSaveConfirm: "Save",
    badgeTexturePuree: "Smooth Puree / Strained (6-8m)",
    badgeTextureMashed: "Lumpy / Mashed (9-11m)",
    badgeTextureFamily: "Chopped Family Food (12m+)",
    texturePuree: "Recommended Texture: Smooth Puree / Strained (6-8 months)",
    textureMashed: "Recommended Texture: Lumpy / Mashed (9-11 months)",
    textureFamily: "Recommended Texture: Chopped Family Food (12+ months)",
    pantryStaples: "plus basic pantry staples automatically.",
    portionLabel: "Serving",
    milestoneTitle: "Development Milestones",
    shoppingListTitle: "Shopping List",
    shoppingListDesc: "These ingredients are needed for tomorrow but not in your fridge:",
    shoppingListEmpty: "All ingredients are already in your fridge! 🎉",
    shoppingListCopy: "Copy List",
    shoppingListCopied: "Copied! ✓",
    shoppingListShare: "Share via WhatsApp",
    historyTitle: "Menu History (7 Days)",
    historyEmpty: "No previous menu history yet.",
    historyLoad: "Load This Menu"
  }
};

/* ─── Meal Slot Metadata ──────────────────── */
const MEAL_SLOTS = [
  { id: "breakfast" as const, label: "Breakfast",   emoji: "🌅", sub: "Pagi",          fast: true  },
  { id: "am_snack"  as const, label: "AM Snack",    emoji: "🍌", sub: "Selingan Pagi",  fast: false },
  { id: "lunch"     as const, label: "Lunch",       emoji: "🍱", sub: "Makan Siang",    fast: false },
  { id: "pm_snack"  as const, label: "PM Snack",    emoji: "🍎", sub: "Selingan Sore",  fast: false },
  { id: "dinner"    as const, label: "Dinner",      emoji: "🌙", sub: "Makan Malam",    fast: false },
];

const SUGGESTED_INGREDIENTS = [
  "Nasi", "Tahu", "Tempe", "Wortel", "Brokoli",
  "Telur", "Dada Ayam", "Ikan Kakap", "Bayam", "Kentang",
  "Labu Kuning", "Pisang", "Alpukat", "Pepaya",
];

/* ─── Milestone Data ────────────────────────── */
const MILESTONE_DATA = {
  "6-8": {
    id: {
      intro: "Si kecil mulai membutuhkan gizi tambahan selain ASI.",
      skills: ["Mulai duduk dengan bantuan", "Meraih & menggenggam benda", "Tertarik melihat orang makan"],
      tips: ["Perkenalkan 1 bahan baru setiap 3 hari", "Mulai dari 1-2 sdm, naikkan perlahan", "Hindari garam, gula, dan madu"],
    },
    en: {
      intro: "Your baby is starting to need nutrients beyond breast milk.",
      skills: ["Starting to sit with support", "Reaching & grasping objects", "Interested in watching others eat"],
      tips: ["Introduce 1 new ingredient every 3 days", "Start with 1-2 tbsp, increase gradually", "Avoid salt, sugar, and honey"],
    },
  },
  "9-11": {
    id: {
      intro: "Tahap finger foods dimulai — tekstur mulai lebih kasar.",
      skills: ["Duduk tanpa bantuan", "Menggigit & mengunyah makanan lunak", "Memegang makanan sendiri"],
      tips: ["Coba finger foods lunak (pisang, tahu kukus)", "Variasikan protein: ayam, ikan, telur, tahu", "Porsi 125–175ml per makan"],
    },
    en: {
      intro: "Finger food stage begins — textures get lumpier.",
      skills: ["Sitting without support", "Biting & chewing soft foods", "Self-feeding finger foods"],
      tips: ["Offer soft finger foods (banana, steamed tofu)", "Vary proteins: chicken, fish, egg, tofu", "Portion: 125–175ml per meal"],
    },
  },
  "12-24": {
    id: {
      intro: "Si kecil siap beralih ke makanan keluarga yang disesuaikan.",
      skills: ["Berjalan & menjelajah aktif", "Menggunakan sendok dengan bantuan", "Ikut makan bersama keluarga"],
      tips: ["Sajikan dalam potongan kecil & lunak", "Batasi garam & gula, hindari junk food", "Porsi 175–250ml per makan"],
    },
    en: {
      intro: "Your toddler is ready for adapted family foods.",
      skills: ["Walking & actively exploring", "Using a spoon with help", "Joining family meals"],
      tips: ["Serve in small, soft pieces", "Limit salt & sugar, avoid junk food", "Portion: 175–250ml per meal"],
    },
  },
};

/* ─── History Entry Type ─────────────────────── */
type HistoryEntry = {
  date: string;
  matrix: MealMatrix;
  ingredients: string[];
};

/* ─── Skeleton Card ──────────────────────── */
function SkeletonCard() {
  return (
    <div className="meal-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded-full animate-shimmer" />
          <div className="h-2 w-16 rounded-full animate-shimmer" />
        </div>
        <div className="h-5 w-16 rounded-full animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full animate-shimmer" />
        <div className="h-4 w-3/4 rounded-full animate-shimmer" />
        <div className="h-3 w-1/2 rounded-full animate-shimmer mt-3" />
      </div>
    </div>
  );
}

/* ─── Placeholder Card ───────────────────── */
function PlaceholderCard({ slot, index }: { slot: typeof MEAL_SLOTS[number]; index: number }) {
  const delayClass = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"][index];
  return (
    <div className={`meal-card animate-fade-up ${delayClass}`} style={{ cursor: "default" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}>
            {slot.emoji}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {slot.sub}
            </p>
            <h3 className="font-bold text-sm"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {slot.label}
            </h3>
          </div>
        </div>
        {slot.fast && (
          <span className="badge-fast"><IconClock size={11} />&lt;30 min</span>
        )}
      </div>
      <div className="space-y-2 py-2">
        {["85%","65%","45%"].map((w, i) => (
          <div key={i} className={`h-${i === 2 ? "2.5" : "3"} rounded-full`}
            style={{ background: "var(--border-default)", width: w, opacity: 0.2 - i * 0.05 }} />
        ))}
      </div>
      <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        ✨ Resep akan muncul di sini
      </p>
    </div>
  );
}

/* ─── Real Meal Card Component ───────────── */
function MealCard({
  slot,
  meal,
  index,
  onSaveFavorite,
  isFavorite,
  onStartCooking,
  lang,
}: {
  slot: typeof MEAL_SLOTS[number];
  meal: MealEntry;
  index: number;
  onSaveFavorite: (meal: MealEntry) => void;
  isFavorite: boolean;
  onStartCooking: (meal: MealEntry, slot: typeof MEAL_SLOTS[number]) => void;
  lang: "id" | "en";
}) {
  const t = TRANSLATIONS[lang];
  const [expanded, setExpanded] = useState(false);

  if (!meal) return null;

  const delayClass = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"][index];
  const isBreakfast = slot.id === "breakfast";

  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent((lang === "id" ? "Resep MPASI " : "Baby food recipe ") + meal.name)}`;

  return (
    <div
      className={`meal-card animate-fade-up ${delayClass}`}
      style={{
        background: "var(--bg-elevated)",
        borderColor: "rgba(143, 160, 138, 0.35)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}
          >
            {slot.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {lang === "id" ? slot.sub : slot.label}
            </p>
            <h3 className="font-bold text-sm leading-tight truncate text-zinc-900"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", maxWidth: "160px" }}>
              {meal.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onSaveFavorite(meal)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-zinc-100 cursor-pointer"
            style={{ color: isFavorite ? "var(--color-accent-coral)" : "var(--text-muted)" }}
            title={lang === "id" ? "Simpan ke Folder Favorit" : "Save to Folder"}
          >
            <IconHeart size={16} filled={isFavorite} />
          </button>
          {isBreakfast && meal.cookingTime <= 30 && (
            <span className="badge-fast"><IconClock size={11} />{meal.cookingTime} {lang === "id" ? "mnt" : "mins"}</span>
          )}
          {!isBreakfast && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1.5px solid var(--border-default)" }}>
              <IconClock size={11} />{meal.cookingTime} {lang === "id" ? "mnt" : "mins"}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-3.5" style={{ color: "var(--text-secondary)" }}>
        {meal.description}
      </p>

      {/* Nutrition highlight */}
      <div className="flex items-start gap-2 mb-3 rounded-xl p-3"
        style={{ background: "var(--color-accent-green-bg)", border: "1.5px solid rgba(16,185,129,0.2)" }}>
        <span style={{ fontSize: "14px" }}>🌱</span>
        <p className="text-xs leading-relaxed font-bold" style={{ color: "var(--color-accent-green-txt)" }}>
          {meal.nutritionHighlight}
        </p>
      </div>

      {/* Portion Size */}
      {meal.portionSize && (
        <div className="flex items-center gap-1.5 mb-3.5 px-1"
          style={{ color: "var(--text-secondary)" }}>
          <span className="text-sm">🥄</span>
          <span className="text-[11px] font-semibold">
            {t.portionLabel}: <span style={{ color: "var(--text-primary)" }}>{meal.portionSize}</span>
          </span>
        </div>
      )}

      {/* Mulai Masak (Visual) */}
      <button
        onClick={() => onStartCooking(meal, slot)}
        className="w-full mb-3.5 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        style={{
          background: "var(--color-brand-primary)",
          color: "white",
          boxShadow: "var(--shadow-coral)"
        }}
      >
        <span>🍳 {t.btnCook}</span>
      </button>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          id={`expand-${slot.id}`}
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center justify-between py-2.5 rounded-xl px-3.5 transition-all cursor-pointer"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
        >
          <span className="text-xs font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            {expanded ? t.btnExpandHide : t.btnExpandShow}
          </span>
          <IconChevron size={14} open={expanded} />
        </button>

        <a
          href={tiktokSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-zinc-100 active:scale-95 border"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)"
          }}
        >
          <IconTikTok size={13} />
          <span>TikTok</span>
        </a>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
          {/* Ingredients */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {t.resepBahan}
            </p>
            <ul className="space-y-1.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-accent-coral)" }}>•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {t.resepInstruksi}
            </p>
            <ol className="space-y-2.5">
              {meal.instructions.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs"
                  style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold flex-shrink-0 text-zinc-900" style={{ color: "var(--text-primary)" }}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────── */
export default function HomePage() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [activeNav, setActiveNav] = useState<"home" | "favorites" | "settings">("home");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matrix, setMatrix] = useState<MealMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ─── User Profile & Settings State ────────── */
  const [childName, setChildName] = useState("Adik");
  const [childAgeMonths, setChildAgeMonths] = useState<number | "">(8);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState("");

  /* ─── Favorite Collection Folders State ────── */
  const [favorites, setFavorites] = useState<{ id: string; meal: MealEntry; folderId: string }[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([
    { id: "default", name: "Semua Favorit" },
    { id: "fast", name: "Sarapan Cepat" },
    { id: "nogtm", name: "Anti GTM" }
  ]);
  const [activeFolderId, setActiveFolderId] = useState("default");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedMealForSave, setSelectedMealForSave] = useState<MealEntry | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);

  /* ─── Visual Cooking Overlay State ────────── */
  const [activeCookingMeal, setActiveCookingMeal] = useState<MealEntry | null>(null);
  const [activeCookingSlot, setActiveCookingSlot] = useState<typeof MEAL_SLOTS[number] | null>(null);
  const [activeCookingStep, setActiveCookingStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  /* ─── Shopping State ──────────────── */
  const [copiedShopping, setCopiedShopping] = useState(false);

  /* ─── History State ──────────────── */
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const ageNum = typeof childAgeMonths === "number" ? childAgeMonths : 8;

  const t = TRANSLATIONS[lang];

  /* ─── Computed: Shopping List ──────────────── */
  const shoppingList = useMemo(() => {
    if (!matrix) return [];
    const allIngredients = MEAL_SLOTS.flatMap((slot) => matrix[slot.id]?.ingredients ?? []);
    const normalize = (s: string) =>
      s.toLowerCase()
       .replace(/^\d[\d.,/\s]*\s*(g|gram|kg|ml|liter|l|buah|siung|lembar|sdm|sdt|batang|helai|cup|mangkuk|butir|potong|iris|genggam|biji|ekor|fillet)\b\s*/i, "")
       .replace(/^\d+\s*[-–]\s*\d+\s*/, "")
       .trim();
    const fridgeSet = new Set(ingredients.map(normalize));
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of allIngredients) {
      const key = normalize(raw);
      if (key.length < 2) continue;
      if (seen.has(key)) continue;
      const inFridge = [...fridgeSet].some((f) => f.includes(key) || key.includes(f));
      if (!inFridge) {
        seen.add(key);
        result.push(raw);
      }
    }
    return result.slice(0, 20);
  }, [matrix, ingredients]);

  // Sync state helpers checking Supabase environment variables status
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co";

  /* ─── 1. INITIAL MOUNT LOAD DATA ─── */
  useEffect(() => {
    async function loadData() {
      // Always load profile from localstorage
      const storedLang = localStorage.getItem("mpasi_lang") as "id" | "en";
      if (storedLang) setLang(storedLang);

      const storedName = localStorage.getItem("mpasi_childName");
      if (storedName) setChildName(storedName);

      const storedAge = localStorage.getItem("mpasi_childAgeMonths");
      if (storedAge) setChildAgeMonths(Number(storedAge));

      const storedAllergies = localStorage.getItem("mpasi_allergies");
      if (storedAllergies) setAllergies(JSON.parse(storedAllergies));

      // History is always local regardless of Supabase
      const storedHistory = localStorage.getItem("mpasi_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      if (isSupabaseConfigured) {
        try {
          // Fetch Fridge Inventory from Supabase
          const { data: invData } = await supabase.from("fridge_inventory").select("name");
          if (invData) {
            setIngredients(invData.map((row) => row.name));
          }

          // Fetch Folders from Supabase
          const { data: foldData } = await supabase.from("folders").select("id, name");
          if (foldData && foldData.length > 0) {
            setFolders(foldData);
          }

          // Fetch Favorites from Supabase
          const { data: favData } = await supabase.from("favorite_meals").select("*");
          if (favData) {
            const formatted = favData.map((row) => ({
              id: row.id,
              folderId: row.folder_id,
              meal: {
                name: row.name,
                description: row.description || "",
                ingredients: row.ingredients,
                instructions: row.instructions,
                cookingTime: row.cooking_time,
                nutritionHighlight: row.nutrition_highlight || "",
                portionSize: row.portion_size || "",
              }
            }));
            setFavorites(formatted);
          }
          return; // Skip loading favorites/folders from localstorage if Supabase loaded successfully
        } catch (e) {
          console.warn("Supabase fetch failed, falling back to localStorage", e);
        }
      }

      // LocalStorage Fallbacks
      const storedFavs = localStorage.getItem("mpasi_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedFolders = localStorage.getItem("mpasi_folders");
      if (storedFolders) setFolders(JSON.parse(storedFolders));
    }

    loadData();
  }, [isSupabaseConfigured]);

  const saveProfileData = (name: string, allergyList: string[], ageMonths: number | "") => {
    localStorage.setItem("mpasi_childName", name);
    localStorage.setItem("mpasi_allergies", JSON.stringify(allergyList));
    const ageVal = ageMonths === "" ? 8 : Math.max(6, Math.min(24, ageMonths));
    localStorage.setItem("mpasi_childAgeMonths", String(ageVal));
  };

  const toggleLanguage = () => {
    const nextLang = lang === "id" ? "en" : "id";
    setLang(nextLang);
    localStorage.setItem("mpasi_lang", nextLang);
  };

  /* ─── 2. FRIDGE INVENTORY ACTIONS ─── */
  async function addIngredient(name: string) {
    const trimmed = name.trim();
    if (!trimmed || ingredients.includes(trimmed)) {
      setInputValue("");
      return;
    }

    const updated = [...ingredients, trimmed];
    setIngredients(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("fridge_inventory").insert([{ name: trimmed }]);
      } catch (e) {
        console.error("Failed to sync new ingredient to Supabase", e);
      }
    }
    setInputValue("");
  }

  async function removeIngredient(name: string) {
    const updated = ingredients.filter((i) => i !== name);
    setIngredients(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("fridge_inventory").delete().eq("name", name);
      } catch (e) {
        console.error("Failed to delete ingredient from Supabase", e);
      }
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && ingredients.length) {
      removeIngredient(ingredients[ingredients.length - 1]);
    }
  }

  /* ─── 3. ALLERGY ACTIONS ─── */
  function addAllergy() {
    const allergy = newAllergyInput.trim();
    if (allergy && !allergies.includes(allergy)) {
      const updated = [...allergies, allergy];
      setAllergies(updated);
      saveProfileData(childName, updated, childAgeMonths);
    }
    setNewAllergyInput("");
  }

  function removeAllergy(name: string) {
    const updated = allergies.filter((a) => a !== name);
    setAllergies(updated);
    saveProfileData(childName, updated, childAgeMonths);
  }

  /* ─── 4. FAVORITES & FOLDER ACTIONS ─── */
  async function handleInitiateSave(meal: MealEntry) {
    const existing = favorites.find((f) => f.meal.name === meal.name);
    if (existing) {
      // Delete item
      const updated = favorites.filter((f) => f.meal.name !== meal.name);
      setFavorites(updated);

      if (isSupabaseConfigured) {
        try {
          await supabase.from("favorite_meals").delete().eq("id", existing.id);
        } catch (e) {
          console.error("Failed to delete favorite from Supabase", e);
        }
      } else {
        localStorage.setItem("mpasi_favorites", JSON.stringify(updated));
      }
    } else {
      setSelectedMealForSave(meal);
      setShowFolderModal(true);
    }
  }

  async function handleConfirmSaveToFolder(folderId: string) {
    if (!selectedMealForSave) return;
    const randomId = Math.random().toString(36).substring(7);
    const newFav = {
      id: randomId,
      meal: selectedMealForSave,
      folderId
    };

    const updated = [...favorites, newFav];
    setFavorites(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("favorite_meals").insert([
          {
            id: randomId,
            folder_id: folderId,
            name: selectedMealForSave.name,
            description: selectedMealForSave.description,
            ingredients: selectedMealForSave.ingredients,
            instructions: selectedMealForSave.instructions,
            cooking_time: selectedMealForSave.cookingTime,
            nutrition_highlight: selectedMealForSave.nutritionHighlight
          }
        ]);
      } catch (e) {
        console.error("Failed to insert favorite to Supabase", e);
      }
    } else {
      localStorage.setItem("mpasi_favorites", JSON.stringify(updated));
    }

    setShowFolderModal(false);
    setSelectedMealForSave(null);
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;

    const randomId = Math.random().toString(36).substring(7);
    const newFolder = { id: randomId, name };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("folders").insert([{ id: randomId, name }]);
      } catch (e) {
        console.error("Failed to create folder in Supabase", e);
      }
    } else {
      localStorage.setItem("mpasi_folders", JSON.stringify(updatedFolders));
    }

    setNewFolderName("");
  }

  async function handleDeleteFolder(folderId: string) {
    // Prevent default folders from deleting
    if (folderId === "default" || folderId === "fast" || folderId === "nogtm") return;

    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);

    // Re-categorize favorites under this folder to default
    const updatedFavs = favorites.map((f) => {
      if (f.folderId === folderId) {
        return { ...f, folderId: "default" };
      }
      return f;
    });
    setFavorites(updatedFavs);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("folders").delete().eq("id", folderId);
      } catch (e) {
        console.error("Failed to delete folder from Supabase", e);
      }
    } else {
      localStorage.setItem("mpasi_folders", JSON.stringify(updatedFolders));
      localStorage.setItem("mpasi_favorites", JSON.stringify(updatedFavs));
    }

    if (activeFolderId === folderId) {
      setActiveFolderId("default");
    }
  }

  /* ─── 5. AI MEAL MATRIX GENERATION ─── */
  async function handleGenerate() {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const ageVal = childAgeMonths === "" ? 8 : Math.max(6, Math.min(24, Number(childAgeMonths)));
      setChildAgeMonths(ageVal);
      saveProfileData(childName, allergies, ageVal);

      const response = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          allergies,
          childName,
          childAgeMonths: ageVal
        })
      });

      if (!response.ok) {
        throw new Error(lang === "id" ? "Gagal memproses resep AI. Silakan coba kembali." : "Failed to generate recipes. Please try again.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMatrix(data.matrix);

      // Save to meal history (local, max 7 entries)
      const newEntry: HistoryEntry = {
        date: new Date().toISOString(),
        matrix: data.matrix,
        ingredients: [...ingredients],
      };
      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, 7);
        localStorage.setItem("mpasi_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  /* ─── Visual Cooking Helper ────────────── */
  function getStepActionIcon(step: string): string {
    const text = step.toLowerCase();
    if (text.includes("potong") || text.includes("iris") || text.includes("cincang") || text.includes("chop") || text.includes("slice") || text.includes("cut")) return "🔪";
    if (text.includes("rebus") || text.includes("boil") || text.includes("kukus") || text.includes("steam") || text.includes("air")) return "💧";
    if (text.includes("tumis") || text.includes("panaskan") || text.includes("sauté") || text.includes("fry") || text.includes("cook")) return "🍳";
    if (text.includes("saring") || text.includes("haluskan") || text.includes("blender") || text.includes("puree") || text.includes("mash") || text.includes("strain")) return "🥣";
    if (text.includes("sajikan") || text.includes("serve")) return "🍽️";
    return "🧑‍🍳";
  }

  const suggestionsToShow = SUGGESTED_INGREDIENTS.filter(
    (s) => !ingredients.includes(s)
  );

  const favoritesToShow = activeFolderId === "default"
    ? favorites
    : favorites.filter((f) => f.folderId === activeFolderId);

  // Time-based custom greeting
  const hour = new Date().getHours();
  const greeting = 
    hour < 11 
      ? (lang === "id" ? "Selamat Pagi" : "Good Morning") 
      : hour < 15 
      ? (lang === "id" ? "Selamat Siang" : "Good Afternoon") 
      : hour < 19 
      ? (lang === "id" ? "Selamat Sore" : "Good Afternoon") 
      : (lang === "id" ? "Selamat Malam" : "Good Evening");

  return (
    <>
      {/* Desktop/Tablet Top Navigation Header */}
      <header className="hidden md:block w-full border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-zinc-950 text-white" style={{ background: "var(--color-brand-primary)" }}>
              <span className="text-lg">👶</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Smart Fridge <span className="text-zinc-400">MPASI AI</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(["home", "favorites", "settings"] as const).map((id) => {
              const isActive = activeNav === id;
              const label = id === "home" ? t.navHome : id === "favorites" ? t.navFav : t.navSetting;
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  style={
                    isActive 
                      ? { background: "var(--color-brand-primary)", color: "white" } 
                      : { color: "var(--text-secondary)", background: "transparent" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)"
              }}
            >
              {lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
            </button>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl border"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}>
              {t.greeting} {childName}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-lg mx-auto bg-base min-h-screen relative shadow-sm pb-16 md:max-w-6xl md:px-6 md:pb-12">
        
        {/* ─── HOME TAB ────────────────────────────────────────────────────────── */}
        {activeNav === "home" && (
          <div className="max-w-6xl mx-auto">
            <header className="px-6 pt-10 pb-8 animate-fade-in md:px-0 md:pt-12 md:pb-10 max-w-2xl">
              <div className="flex justify-between items-center mb-6 md:hidden">
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-secondary)"
                  }}
                >
                  {lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-surface"
                  style={{ borderColor: "var(--border-default)" }}>
                  <span className="text-lg">👶</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: "var(--color-brand-primary)", fontFamily: "var(--font-body)" }}>
                  🌅 {greeting}, {t.greeting} {childName}
                </p>
                <h1 className="text-3xl md:text-4.5xl font-bold leading-tight tracking-tight mb-4"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
                  {t.heroHeadline}
                </h1>
                <p className="text-base md:text-lg mb-6 leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", lineHeight: "1.6" }}>
                  {t.heroSubheadline}
                </p>
                <div className="flex flex-wrap gap-3.5">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || ingredients.length === 0}
                    className="btn-primary w-auto"
                    style={{ padding: "0.85rem 1.75rem", fontSize: "0.88rem" }}
                  >
                    {t.heroPrimaryCTA}
                  </button>
                  <button
                    onClick={() => {
                      const fridgeSec = document.getElementById("fridge-inventory-section");
                      if (fridgeSec) {
                        fridgeSec.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="btn-secondary w-auto"
                    style={{ padding: "0.85rem 1.75rem", fontSize: "0.88rem" }}
                  >
                    {t.heroSecondaryCTA}
                  </button>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 md:items-start">
              {/* Stats Bar */}
              <div className="px-6 mb-8 animate-fade-up stagger-1 col-span-12 md:col-span-7 md:order-2 md:px-0">
                <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
                  {[
                    { value: "5",     label: lang === "id" ? "Menu/Hari" : "Meals/Day",    color: "var(--color-brand-primary)"   },
                    { value: "<30",   label: lang === "id" ? "Menit Masak" : "Cook Time",  color: "var(--color-accent-coral)"  },
                    { value: isSupabaseConfigured ? "Supabase" : "Local",  label: lang === "id" ? "Penyimpanan" : "Storage",  color: "var(--color-brand-primary)"   },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center flex-1">
                      <span className="text-2xl font-extrabold leading-none"
                        style={{ color: stat.color, fontFamily: "var(--font-display)" }}>
                        {stat.value}
                      </span>
                      <span className="text-[10px] font-semibold mt-1.5 tracking-wide text-center"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fridge Inventory & Age Tracker Card */}
              <section id="fridge-inventory-section" className="px-6 mb-8 animate-fade-up stagger-2 col-span-12 md:col-span-5 md:order-1 md:row-span-3 md:px-0">
                <div className="flex items-center gap-3 mb-4.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--bg-elevated)", color: "var(--color-brand-primary)" }}>
                    <IconFridge size={15} />
                  </div>
                  <h2 className="text-base font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {lang === "id" ? "Stok Kulkas & Usia Bayi" : "Fridge Stock & Baby Age"}
                  </h2>
                </div>

                <div className="rounded-2xl p-6 space-y-6"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)" }}>
                  
                  {/* Subsection 1: Baby Age Tracker */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                      👶 {lang === "id" ? "Pilih Kelompok Usia Bayi" : "Select Baby's Age Group"}
                    </p>
                    
                    {/* Name & Age Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>
                          {lang === "id" ? "Nama Anak" : "Child Name"}
                        </label>
                        <input
                          type="text"
                          className="input-field text-xs py-2 px-3"
                          value={childName}
                          onChange={(e) => {
                            setChildName(e.target.value);
                            saveProfileData(e.target.value, allergies, childAgeMonths);
                          }}
                          placeholder="Adik"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>
                          {lang === "id" ? "Usia (Bulan)" : "Age (Months)"}
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="24"
                          className="input-field text-xs py-2 px-3"
                          value={childAgeMonths}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setChildAgeMonths(raw === "" ? "" : Number(raw));
                          }}
                          onBlur={(e) => {
                            const num = Number(e.target.value);
                            const clamped = isNaN(num) || num === 0 ? 8 : Math.max(6, Math.min(24, num));
                            setChildAgeMonths(clamped);
                            saveProfileData(childName, allergies, clamped);
                          }}
                        />
                      </div>
                    </div>

                    {/* Age Group Badges (interactive!) */}
                    <div className="flex gap-2 pt-1">
                      {[
                        { min: 6,  max: 8,  label: lang === "id" ? "6-8 Bln" : "6-8 M",  bg: "rgba(143,160,138,0.15)", txt: "#4E5A4B" },
                        { min: 9,  max: 11, label: lang === "id" ? "9-11 Bln" : "9-11 M", bg: "rgba(245,158,11,0.08)", txt: "#b45309" },
                        { min: 12, max: 24, label: lang === "id" ? "12-24 Bln" : "12-24 M", bg: "rgba(99,102,241,0.08)", txt: "#4338ca" },
                      ].map((grp) => {
                        const isActive = ageNum >= grp.min && ageNum <= grp.max;
                        return (
                          <button
                            key={grp.label}
                            onClick={() => {
                              setChildAgeMonths(grp.min);
                              saveProfileData(childName, allergies, grp.min);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-full text-[10px] font-bold transition-all cursor-pointer text-center border"
                            style={{
                              background: isActive ? grp.bg : "var(--bg-elevated)",
                              color: isActive ? grp.txt : "var(--text-muted)",
                              borderColor: isActive ? grp.txt : "var(--border-default)"
                            }}
                          >
                            {grp.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Texture guidance info text */}
                    <div className="text-[11px] font-semibold px-3 py-2 rounded-xl text-center leading-relaxed"
                      style={{
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-default)"
                      }}>
                      {ageNum <= 8 
                        ? t.texturePuree
                        : ageNum <= 11 
                        ? t.textureMashed
                        : t.textureFamily
                      }
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="h-px" style={{ background: "var(--border-default)" }} />

                  {/* Subsection 2: Fridge Stock */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                      🥦 {lang === "id" ? "Stok Bahan Kulkas Tersedia" : "Current Fridge Stock"}
                    </p>

                    <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                      {ingredients.map((ing) => (
                        <span key={ing} className="tag-pill group">
                          {ing}
                          <button id={`remove-${ing}`} onClick={() => removeIngredient(ing)}
                            className="ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity hover:text-red-400 cursor-pointer"
                            aria-label={`Hapus ${ing}`}>
                            <IconClose size={11} />
                          </button>
                        </span>
                      ))}
                       {ingredients.length === 0 && (
                        <p className="text-xs self-center" style={{ color: "var(--text-muted)" }}>
                          {t.fridgeEmpty}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        id="ingredient-input"
                        type="text"
                        className="input-field text-xs flex-1 py-2 px-3"
                        placeholder={t.fridgePlaceholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                      />
                      <button
                        id="add-ingredient-btn"
                        onClick={() => addIngredient(inputValue)}
                        disabled={!inputValue.trim()}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ background: "var(--color-brand-primary)", color: "white" }}>
                        <IconPlus size={16} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* ── Milestone Tumbuh Kembang Card ── */}
                {(() => {
                  const range: "6-8" | "9-11" | "12-24" = ageNum <= 8 ? "6-8" : ageNum <= 11 ? "9-11" : "12-24";
                  const ms = MILESTONE_DATA[range][lang];
                  return (
                    <div className="mt-4 rounded-2xl p-4 animate-fade-up" style={{ background: "rgba(42,140,96,0.04)", border: "1.5px solid rgba(42,140,96,0.15)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-brand-primary)" }}>
                        👶 {t.milestoneTitle} · {range} {lang === "id" ? "Bln" : "Mo"}
                      </p>
                      <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ms.intro}</p>
                      <div className="space-y-1">
                        {ms.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                            <span className="flex-shrink-0 font-bold mt-px" style={{ color: "var(--color-brand-primary)" }}>✓</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {suggestionsToShow.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold tracking-widest uppercase mb-2"
                      style={{ color: "var(--text-muted)" }}>
                      {t.suggestHeader}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionsToShow.map((s) => (
                        <button id={`suggest-${s}`} key={s} onClick={() => addIngredient(s)}
                          className="text-[11px] px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer"
                          style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-default)",
                            color: "var(--text-secondary)",
                          }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Generate Button */}
              <div className="px-6 mb-8 animate-fade-up stagger-3 col-span-12 md:col-span-7 md:order-3 md:px-0">
                <button
                  id="generate-matrix-btn"
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={isLoading || ingredients.length === 0}
                  aria-label={t.btnGenerate}>
                  {isLoading ? (
                    <>
                      <div className="dot-loader"><span /><span /><span /></div>
                      <span>{t.btnGenerating}</span>
                    </>
                  ) : matrix ? (
                    <>
                      <IconRefresh size={18} />
                      <span>{t.btnRegenerate}</span>
                    </>
                  ) : (
                    <>
                      <IconSpark size={20} />
                      <span>{t.btnGenerate}</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-3.5 rounded-xl p-3 animate-fade-in"
                    style={{ background: "#FFEBE9", border: "1.5px solid #FFC5C0" }}>
                    <p className="text-xs text-center font-semibold" style={{ color: "#E04E3E" }}>⚠️ {error}</p>
                  </div>
                )}
              </div>

              {/* 5-Meal Matrix */}
              <section className="px-6 pb-28 animate-fade-up stagger-4 col-span-12 md:col-span-7 md:order-4 md:px-0">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {t.matrixHeader}
                  </h2>
                  <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                      background: matrix ? "rgba(16, 185, 129, 0.08)" : "rgba(9, 9, 11, 0.05)",
                      color: matrix ? "var(--color-accent-green)" : "var(--text-muted)",
                      border: "1px solid currentColor"
                    }}>
                    {matrix ? t.statusGenerated : t.statusWaiting}
                  </span>
                </div>

                {isLoading ? (
                  <div className="space-y-5.5">
                    {MEAL_SLOTS.map((slot) => <SkeletonCard key={slot.id} />)}
                  </div>
                ) : matrix ? (
                  <div className="space-y-5.5">
                    {MEAL_SLOTS.map((slot, i) => (
                      <MealCard
                        key={slot.id}
                        slot={slot}
                        meal={matrix[slot.id]}
                        index={i}
                        onSaveFavorite={handleInitiateSave}
                        isFavorite={matrix[slot.id] ? favorites.some((f) => f.meal?.name === matrix[slot.id].name) : false}
                        onStartCooking={(meal, slot) => {
                          setActiveCookingMeal(meal);
                          setActiveCookingSlot(slot);
                          setActiveCookingStep(0);
                          setShowCelebration(false);
                        }}
                        lang={lang}
                      />
                    ))}
                    <p className="text-center text-[10px] pt-2 pb-2" style={{ color: "var(--text-muted)" }}>
                      {lang === "id" ? "Dibuat pukul" : "Generated at"} {new Date(matrix.generatedAt).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })} · Groq LLaMA 3
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5.5">
                    {MEAL_SLOTS.map((slot, i) => (
                      <PlaceholderCard key={slot.id} slot={slot} index={i} />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Shopping List Section ── */}
              {matrix && (
                <section className="px-6 pb-6 col-span-12 md:col-span-7 md:order-5 md:px-0 animate-fade-up">
                  <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛒</span>
                        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                          {t.shoppingListTitle}
                        </h2>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: shoppingList.length === 0 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", color: shoppingList.length === 0 ? "var(--color-accent-green)" : "#b45309", border: "1px solid currentColor" }}>
                        {shoppingList.length === 0 ? "✓ " + (lang === "id" ? "Lengkap" : "Complete") : `${shoppingList.length} ${lang === "id" ? "bahan" : "items"}`}
                      </span>
                    </div>

                    {shoppingList.length === 0 ? (
                      <p className="text-xs py-3 text-center" style={{ color: "var(--text-muted)" }}>{t.shoppingListEmpty}</p>
                    ) : (
                      <>
                        <p className="text-[11px] mb-3" style={{ color: "var(--text-secondary)" }}>{t.shoppingListDesc}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {shoppingList.map((item, i) => (
                            <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(245,158,11,0.08)", color: "#92400e", border: "1px solid rgba(245,158,11,0.2)" }}>
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const text = `🛒 ${t.shoppingListTitle}\n${shoppingList.map((i) => `• ${i}`).join("\n")}`;
                              navigator.clipboard.writeText(text).then(() => {
                                setCopiedShopping(true);
                                setTimeout(() => setCopiedShopping(false), 2000);
                              });
                            }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border"
                            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
                          >
                            {copiedShopping ? t.shoppingListCopied : t.shoppingListCopy}
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`🛒 ${t.shoppingListTitle} MPASI ${childName}\n${shoppingList.map((i) => `• ${i}`).join("\n")}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all active:scale-95 cursor-pointer"
                            style={{ background: "#25D366", color: "white" }}
                          >
                            {t.shoppingListShare}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* ── Meal History Section ── */}
              {history.length > 0 && (
                <section className="px-6 pb-10 col-span-12 md:col-span-7 md:order-6 md:px-0 animate-fade-up">
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
                    <button
                      onClick={() => setShowHistory((v) => !v)}
                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-all hover:bg-zinc-50"
                      style={{ background: "var(--bg-card)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">📅</span>
                        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                          {t.historyTitle}
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(99,102,241,0.08)", color: "#4338ca", border: "1px solid rgba(99,102,241,0.2)" }}>
                          {history.length}
                        </span>
                      </div>
                      <IconChevron size={14} open={showHistory} />
                    </button>

                    {showHistory && (
                      <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
                        {history.map((entry, i) => {
                          const d = new Date(entry.date);
                          const dateLabel = d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short" });
                          const timeLabel = d.toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" });
                          return (
                            <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ background: "var(--bg-card)" }}>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                  {dateLabel} · {timeLabel}
                                </p>
                                <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                                  {entry.ingredients.slice(0, 4).join(", ")}{entry.ingredients.length > 4 ? ` +${entry.ingredients.length - 4}` : ""}
                                </p>
                              </div>
                              <button
                                onClick={() => { setMatrix(entry.matrix); setShowHistory(false); }}
                                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                                style={{ background: "var(--bg-elevated)", color: "var(--color-brand-primary)", border: "1px solid rgba(42,140,96,0.2)" }}
                              >
                                {t.historyLoad}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* ─── FAVORITES TAB ─────────────────────────────────────────────────── */}
        {activeNav === "favorites" && (
          <div className="px-6 pt-8 pb-28 animate-fade-in md:px-0 md:pt-6 md:pb-12">
            <header className="mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                {lang === "id" ? "Koleksi Resep" : "Recipe Collections"}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                <span className="text-gradient-teal">{t.favTitle}</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {t.favSub}
              </p>
            </header>

            <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 md:items-start">
              {/* Left Column: Folders & Create folder */}
              <div className="col-span-12 md:col-span-5 space-y-6">
                
                {/* Create Folder Bar */}
                <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-xs font-bold uppercase mb-2.5" style={{ color: "var(--text-muted)" }}>
                    {t.favFolderCreate}
                  </p>
                  <div className="flex gap-3.5">
                    <input
                      type="text"
                      placeholder={t.favFolderPlaceholder}
                      className="input-field text-xs flex-1 py-2"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <button
                      onClick={handleCreateFolder}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      style={{ background: "var(--gradient-brand)", color: "white" }}
                    >
                      {lang === "id" ? "Buat" : "Create"}
                    </button>
                  </div>
                </div>

                {/* Folders List (TikTok style collections) */}
                <div>
                  <p className="text-xs font-bold uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                    Folders
                  </p>
                  <div className="flex flex-col gap-3">
                    {folders.map((folder) => {
                      const isSelected = activeFolderId === folder.id;
                      const count = folder.id === "default" 
                        ? favorites.length 
                        : favorites.filter((f) => f.folderId === folder.id).length;

                      // Translate standard folders
                      const folderDisplayName = 
                        folder.id === "default" ? (lang === "id" ? "Semua Favorit" : "All Favorites") :
                        folder.id === "fast" ? (lang === "id" ? "Sarapan Cepat" : "Quick Breakfast") :
                        folder.id === "nogtm" ? (lang === "id" ? "Anti GTM" : "Anti GTM (Appetite Loss)") : 
                        folder.name;

                      return (
                        <div
                          key={folder.id}
                          className="flex items-center justify-between p-3 rounded-xl transition-all"
                          style={{
                            background: isSelected ? "rgba(9, 9, 11, 0.05)" : "var(--bg-card)",
                            border: `1.5px solid ${isSelected ? "var(--color-brand-primary)" : "var(--border-default)"}`
                          }}
                        >
                          <button
                            onClick={() => setActiveFolderId(folder.id)}
                            className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-fade-in"
                              style={{
                                background: isSelected ? "rgba(9, 9, 11, 0.08)" : "var(--bg-elevated)",
                                color: "var(--color-brand-primary)"
                              }}>
                              <IconFolder size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold" style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                {folderDisplayName}
                              </p>
                              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {count} {lang === "id" ? "resep disimpan" : "recipes saved"}
                              </p>
                            </div>
                          </button>

                          {folder.id !== "default" && folder.id !== "fast" && folder.id !== "nogtm" && (
                            <button
                              onClick={() => handleDeleteFolder(folder.id)}
                              className="p-1 text-red-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                              title={lang === "id" ? "Hapus folder" : "Delete folder"}
                            >
                              <IconClose size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Favorited Recipes List */}
              <div className="col-span-12 md:col-span-7">
                <p className="text-xs font-bold uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                  {lang === "id" ? "Resep di Folder Ini" : "Recipes in This Folder"}
                </p>

                <div className="space-y-5.5">
                  {favoritesToShow.map((fav, i) => (
                    <MealCard
                      key={fav.id}
                      slot={MEAL_SLOTS[i % MEAL_SLOTS.length]}
                      meal={fav.meal}
                      index={i}
                      onSaveFavorite={handleInitiateSave}
                      isFavorite={true}
                      onStartCooking={(meal, slot) => {
                        setActiveCookingMeal(meal);
                        setActiveCookingSlot(slot);
                        setActiveCookingStep(0);
                        setShowCelebration(false);
                      }}
                      lang={lang}
                    />
                  ))}

                  {favoritesToShow.length === 0 && (
                    <div className="text-center py-8 rounded-2xl animate-fade-in" style={{ border: "1px dashed var(--border-default)" }}>
                      <span className="text-2xl opacity-60">📂</span>
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        {t.favFolderEmpty}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─────────────────────────────────────────────────── */}
        {activeNav === "settings" && (
          <div className="px-6 pt-8 pb-28 animate-fade-in md:px-0 md:pt-6 md:pb-12">
            <header className="mb-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                {lang === "id" ? "Profil" : "Profile"}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                <span className="text-gradient-teal">{t.settTitle}</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {t.settSub}
              </p>
            </header>

            <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 md:items-start">
              {/* Left Column: Child Profile Section */}
              <div className="col-span-12 md:col-span-7">
                <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)" }}>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {t.settChildHeader}
                  </h3>

                  {/* Input Name */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      {t.settNameLabel}
                    </label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        saveProfileData(e.target.value, allergies, childAgeMonths);
                      }}
                      placeholder={lang === "id" ? "Contoh: Adik" : "Example: Kiddo"}
                    />
                  </div>

                  {/* Input Age */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      {t.settAgeLabel}
                    </label>
                    <div className="flex flex-col gap-2.5">
                      <input
                        type="number"
                        min="6"
                        max="24"
                        className="input-field text-sm w-full"
                        value={childAgeMonths}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setChildAgeMonths(raw === "" ? "" : Number(raw));
                        }}
                        onBlur={(e) => {
                          const num = Number(e.target.value);
                          const clamped = isNaN(num) || num === 0 ? 8 : Math.max(6, Math.min(24, num));
                          setChildAgeMonths(clamped);
                          saveProfileData(childName, allergies, clamped);
                        }}
                        placeholder={lang === "id" ? "Masukkan usia dalam bulan (6-24)" : "Enter age in months (6-24)"}
                      />
                      <div className="text-[11px] font-semibold px-3 py-2 rounded-xl text-center"
                        style={{
                          background: ageNum <= 8 ? "rgba(16, 185, 129, 0.08)" : ageNum <= 11 ? "rgba(245, 158, 11, 0.08)" : "rgba(99, 102, 241, 0.08)",
                          color: ageNum <= 8 ? "#065f46" : ageNum <= 11 ? "#b45309" : "#4338ca",
                          border: ageNum <= 8 ? "1px solid rgba(16, 185, 129, 0.2)" : ageNum <= 11 ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid rgba(99, 102, 241, 0.2)"
                        }}>
                        {ageNum <= 8 
                          ? t.texturePuree
                          : ageNum <= 11 
                          ? t.textureMashed
                          : t.textureFamily
                        }
                      </div>
                    </div>
                  </div>

                  {/* Allergies / Ignored Ingredients */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      {t.settAllergenLabel}
                    </label>
                    
                    {/* Allergy tag list */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {allergies.map((allergy) => (
                        <span key={allergy} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#c53030", border: "1px solid rgba(239,68,68,0.2)" }}>
                          {allergy}
                          <button onClick={() => removeAllergy(allergy)} className="hover:text-red-600 cursor-pointer">
                            <IconClose size={10} />
                          </button>
                        </span>
                      ))}
                      {allergies.length === 0 && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.settAllergenEmpty}
                        </p>
                      )}
                    </div>

                    {/* Add Allergy input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.settAllergenPlaceholder}
                        className="input-field text-xs flex-1 py-2"
                        value={newAllergyInput}
                        onChange={(e) => setNewAllergyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                      />
                      <button
                        onClick={addAllergy}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border"
                        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
                      >
                        {t.settAllergenAdd}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Database / Sync Settings */}
              <div className="col-span-12 md:col-span-5">
                <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)" }}>
                  <h3 className="text-sm font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>
                    {t.settDbHeader}
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-dashed border-[rgba(9,9,11,0.08)]">
                      <span>{t.settDbStatus}</span>
                      <span className="font-bold flex items-center gap-1.5" style={{ color: isSupabaseConfigured ? "var(--color-accent-green)" : "var(--color-accent-coral)" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: isSupabaseConfigured ? "var(--color-accent-green)" : "var(--color-accent-coral)" }} />
                        {isSupabaseConfigured ? t.settDbConnected : t.settDbFallback}
                      </span>
                    </div>

                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {isSupabaseConfigured ? t.settDbDescConnected : t.settDbDescLocal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Folder Selection Modal ── */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-fade-up"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {t.modalSaveTitle}
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="text-neutral-500 opacity-60 hover:opacity-100 cursor-pointer">
                <IconClose size={18} />
              </button>
            </div>

            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              {lang === "id" ? (
                <>Simpan resep <strong style={{ color: "var(--text-accent)" }}>{selectedMealForSave?.name}</strong> ke dalam folder:</>
              ) : (
                <>Save recipe <strong style={{ color: "var(--text-accent)" }}>{selectedMealForSave?.name}</strong> to folder:</>
              )}
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide mb-4">
              {folders.map((folder) => {
                const folderDisplayName = 
                  folder.id === "default" ? (lang === "id" ? "Semua Favorit" : "All Favorites") :
                  folder.id === "fast" ? (lang === "id" ? "Sarapan Cepat" : "Quick Breakfast") :
                  folder.id === "nogtm" ? (lang === "id" ? "Anti GTM" : "Anti GTM (Appetite Loss)") : 
                  folder.name;

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleConfirmSaveToFolder(folder.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-neutral-100 cursor-pointer"
                    style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-default)" }}
                  >
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{folderDisplayName}</span>
                    <IconFolder size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Kitchen Mode Modal ── */}
      {activeCookingMeal && activeCookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              boxShadow: "var(--shadow-strong)",
              minHeight: "450px"
            }}>
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "var(--border-default)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ background: "var(--color-accent-coral-bg)", color: "var(--color-accent-coral)", border: "1px solid rgba(255, 107, 90, 0.2)" }}>
                  {lang === "id" ? activeCookingSlot.sub : activeCookingSlot.label}
                </span>
                <h3 className="font-extrabold text-base mt-1.5 text-zinc-900 leading-tight" style={{ color: "var(--text-primary)" }}>
                  {activeCookingMeal.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveCookingMeal(null);
                  setActiveCookingSlot(null);
                  setShowCelebration(false);
                }}
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            {/* Content: Step Slide */}
            {!showCelebration ? (
              <div className="flex-1 flex flex-col justify-center py-8 text-center">
                {/* Large Action Emoji */}
                <div className="text-6xl mb-4 animate-bounce-slow">
                  {getStepActionIcon(activeCookingMeal.instructions[activeCookingStep] || "")}
                </div>
                
                {/* Step Count */}
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  {t.cookingStep} {activeCookingStep + 1} {t.cookingOf} {activeCookingMeal.instructions.length}
                </p>

                {/* Instruction text with large font */}
                <p className="text-xl md:text-2xl font-bold leading-relaxed px-2 text-zinc-900" style={{ color: "var(--text-primary)" }}>
                  {activeCookingMeal.instructions[activeCookingStep]}
                </p>

                {/* Micro Progress dots */}
                <div className="flex justify-center gap-1.5 mt-8">
                  {activeCookingMeal.instructions.map((_, idx) => (
                    <span
                      key={idx}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: idx === activeCookingStep ? "16px" : "6px",
                        background: idx === activeCookingStep ? "var(--color-brand-primary)" : "var(--border-default)",
                        opacity: idx === activeCookingStep ? 1 : 0.4
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Success/Celebration Screen */
              <div className="flex-1 flex flex-col justify-center py-8 text-center animate-fade-up">
                <div className="text-7xl mb-4">✨👶🎉</div>
                <h4 className="text-2xl font-extrabold text-gradient-teal mb-3">
                  {t.cookingSuccessTitle}
                </h4>
                <p className="text-sm px-4 leading-relaxed text-zinc-600" style={{ color: "var(--text-secondary)" }}>
                  {t.cookingSuccessDesc.replace("{childName}", childName)}
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
              {!showCelebration ? (
                <>
                  <button
                    onClick={() => setActiveCookingStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeCookingStep === 0}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                  >
                    {t.cookingBack}
                  </button>
                  <button
                    onClick={() => {
                      if (activeCookingStep < activeCookingMeal.instructions.length - 1) {
                        setActiveCookingStep((prev) => prev + 1);
                      } else {
                        setShowCelebration(true);
                      }
                    }}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{ background: "var(--color-brand-primary)" }}
                  >
                    {activeCookingStep === activeCookingMeal.instructions.length - 1 ? t.cookingDone : t.cookingNext}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveCookingMeal(null);
                    setActiveCookingSlot(null);
                    setShowCelebration(false);
                  }}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  style={{ background: "var(--color-brand-primary)" }}
                >
                  {t.cookingClose}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation ────────── */}
      <nav className="bottom-nav md:hidden" aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}>
        <div className="nav-inner">
          {(["home", "favorites", "settings"] as const).map((id) => {
            const isActive = activeNav === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                className={`nav-item${isActive ? " active" : ""}`}
                onClick={() => setActiveNav(id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={id === "home" ? (lang === "id" ? "Beranda" : "Home") : id === "favorites" ? (lang === "id" ? "Favorit" : "Favorites") : (lang === "id" ? "Pengaturan" : "Settings")}>
                <span className="relative">
                  {id === "home" && <IconHome active={isActive} />}
                  {id === "favorites" && <IconHeart filled={isActive} />}
                  {id === "settings" && <IconSettings />}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--color-brand-primary)" }} />
                  )}
                </span>
                <span className="nav-label">
                  {id === "home" ? t.navHome : id === "favorites" ? t.navFav : t.navSetting}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
