"use client";

import { useState } from "react";
import type { MealMatrix, MealEntry } from "./api/generate-meals/route";

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
            style={{ background: "rgba(15,118,110,0.15)", border: "1px solid rgba(45,212,191,0.12)" }}>
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

/* ─── Real Meal Card ─────────────────────── */
function MealCard({
  slot,
  meal,
  index,
}: {
  slot: typeof MEAL_SLOTS[number];
  meal: MealEntry;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const delayClass = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"][index];
  const isBreakfast = slot.id === "breakfast";

  return (
    <div
      className={`meal-card animate-fade-up ${delayClass}`}
      style={isBreakfast ? { border: "1px solid rgba(251,191,36,0.25)", boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(251,191,36,0.1)" } : {}}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: isBreakfast ? "rgba(245,158,11,0.15)" : "rgba(15,118,110,0.15)", border: `1px solid ${isBreakfast ? "rgba(251,191,36,0.2)" : "rgba(45,212,191,0.12)"}` }}
          >
            {slot.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {slot.sub}
            </p>
            <h3 className="font-bold text-sm leading-tight truncate"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", maxWidth: "160px" }}>
              {meal.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isBreakfast && meal.cookingTime <= 30 && (
            <span className="badge-fast"><IconClock size={11} />{meal.cookingTime} min</span>
          )}
          {!isBreakfast && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(45,212,191,0.08)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
              <IconClock size={11} />{meal.cookingTime} min
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
        {meal.description}
      </p>

      {/* Nutrition highlight */}
      <div className="flex items-start gap-2 mb-3 rounded-xl p-2.5"
        style={{ background: "rgba(15,118,110,0.08)", border: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: "14px" }}>🌱</span>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-teal-300)" }}>
          {meal.nutritionHighlight}
        </p>
      </div>

      {/* Expand / Collapse Ingredients & Steps */}
      <button
        id={`expand-${slot.id}`}
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between py-2 rounded-xl px-3 transition-all"
        style={{ background: "rgba(45,212,191,0.05)", border: "1px solid var(--border-subtle)" }}
      >
        <span className="text-xs font-semibold" style={{ color: "var(--text-accent)", fontFamily: "var(--font-display)" }}>
          {expanded ? "Sembunyikan Resep" : "Lihat Resep Lengkap"}
        </span>
        <IconChevron size={14} open={expanded} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Ingredients */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              Bahan
            </p>
            <ul className="space-y-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-teal-400)" }}>•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              Cara Masak
            </p>
            <ol className="space-y-2">
              {meal.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-xs"
                  style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(15,118,110,0.2)", color: "var(--color-teal-400)" }}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
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
  const [activeNav, setActiveNav] = useState<"home" | "favorites" | "settings">("home");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matrix, setMatrix] = useState<MealMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "Selamat Dini Hari" :
    hour < 11 ? "Selamat Pagi" :
    hour < 15 ? "Selamat Siang" :
    hour < 18 ? "Selamat Sore" : "Selamat Malam";

  function addIngredient(name: string) {
    const trimmed = name.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => prev.filter((i) => i !== name));
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

  async function handleGenerate() {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setMatrix(null);
    setError(null);

    try {
      const res = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      setMatrix(data.matrix as MealMatrix);
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  }

  const suggestionsToShow = SUGGESTED_INGREDIENTS.filter(
    (s) => !ingredients.includes(s)
  ).slice(0, 8);

  return (
    <>
      {/* ── Scrollable Content Area ── */}
      <main
        className="flex-1 overflow-y-auto scrollbar-hide pb-28"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        {/* ─── Header ─────────────────── */}
        <header className="px-5 pt-6 pb-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                {greeting}, Mama 👋
              </p>
              <h1 className="text-2xl font-extrabold leading-tight"
                style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-gradient-teal">Smart Fridge</span>
                <br />
                <span style={{ color: "var(--text-primary)" }}>MPASI AI</span>
              </h1>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-teal)" }}>
              <span className="text-xl">👶</span>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Rencanakan{" "}
            <strong style={{ color: "var(--color-amber-300)" }}>5 menu MPASI</strong>{" "}
            besok dari bahan kulkas yang ada. Tidak perlu scroll TikTok lagi!
          </p>
        </header>

        {/* ─── Stats Bar ──────────────── */}
        <div className="px-5 mb-5 animate-fade-up stagger-1">
          <div className="glass rounded-2xl p-4 flex items-center justify-between gap-3">
            {[
              { value: "5",     label: "Menu/Hari",    color: "var(--color-teal-400)"   },
              { value: "<30",   label: "Menit Masak",  color: "var(--color-amber-300)"  },
              { value: "100%",  label: "AI-Powered",   color: "var(--color-teal-300)"   },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center flex-1">
                <span className="text-2xl font-extrabold leading-none"
                  style={{ color: stat.color, fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-semibold mt-1 tracking-wide text-center"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Fridge Inventory ─────── */}
        <section className="px-5 mb-5 animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(15,118,110,0.2)" }}>
              <IconFridge size={15} />
            </div>
            <h2 className="text-base font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Isi Kulkas Saya
            </h2>
            {ingredients.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(15,118,110,0.2)", color: "var(--color-teal-400)" }}>
                {ingredients.length} bahan
              </span>
            )}
          </div>

          <div className="rounded-2xl p-3"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex flex-wrap gap-2 min-h-[40px] mb-3">
              {ingredients.map((ing) => (
                <span key={ing} className="tag-pill group">
                  {ing}
                  <button id={`remove-${ing}`} onClick={() => removeIngredient(ing)}
                    className="ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    aria-label={`Hapus ${ing}`}>
                    <IconClose size={11} />
                  </button>
                </span>
              ))}
              {ingredients.length === 0 && (
                <p className="text-sm self-center" style={{ color: "var(--text-muted)" }}>
                  Belum ada bahan. Ketik di bawah...
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                id="ingredient-input"
                type="text"
                className="input-field text-sm flex-1"
                placeholder="Ketik bahan, lalu Enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Tambah bahan makanan"
              />
              <button
                id="add-ingredient-btn"
                onClick={() => addIngredient(inputValue)}
                disabled={!inputValue.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "var(--gradient-brand)",
                  boxShadow: inputValue.trim() ? "var(--shadow-glow-sm)" : "none",
                }}
                aria-label="Tambah bahan">
                <IconPlus size={18} />
              </button>
            </div>
          </div>

          {suggestionsToShow.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "var(--text-muted)" }}>
                Cepat tambah:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestionsToShow.map((s) => (
                  <button id={`suggest-${s}`} key={s} onClick={() => addIngredient(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-display)",
                    }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ─── Generate CTA ─────────── */}
        <div className="px-5 mb-6 animate-fade-up stagger-3">
          {ingredients.length === 0 && (
            <p className="text-center text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Tambahkan minimal 1 bahan untuk melanjutkan
            </p>
          )}
          <button
            id="generate-matrix-btn"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={isLoading || ingredients.length === 0}
            aria-label="Generate meal matrix dengan AI">
            {isLoading ? (
              <>
                <div className="dot-loader"><span /><span /><span /></div>
                <span>AI sedang berpikir...</span>
              </>
            ) : matrix ? (
              <>
                <IconRefresh size={18} />
                <span>Generate Ulang Matrix</span>
              </>
            ) : (
              <>
                <IconSpark size={20} />
                <span>Generate Matrix Besok</span>
              </>
            )}
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-3 rounded-xl p-3 animate-fade-in"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <p className="text-xs text-center" style={{ color: "#fca5a5" }}>⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* ─── 5-Meal Matrix ──────────── */}
        <section className="px-5 animate-fade-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Matrix 5 Meal
            </h2>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                background: matrix ? "rgba(45,212,191,0.15)" : "rgba(45,212,191,0.08)",
                color: matrix ? "var(--color-teal-400)" : "var(--text-muted)",
                border: matrix ? "1px solid rgba(45,212,191,0.3)" : "none",
              }}>
              {matrix ? "✓ AI Generated" : "Menunggu AI"}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {MEAL_SLOTS.map((slot) => <SkeletonCard key={slot.id} />)}
            </div>
          ) : matrix ? (
            <div className="space-y-3">
              {MEAL_SLOTS.map((slot, i) => (
                <MealCard
                  key={slot.id}
                  slot={slot}
                  meal={matrix[slot.id]}
                  index={i}
                />
              ))}
              {/* Generated timestamp */}
              <p className="text-center text-[10px] pt-1 pb-2"
                style={{ color: "var(--text-muted)" }}>
                Dibuat pukul {new Date(matrix.generatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · Groq LLaMA 3
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {MEAL_SLOTS.map((slot, i) => (
                <PlaceholderCard key={slot.id} slot={slot} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Bottom Navigation ────────── */}
      <nav className="bottom-nav" aria-label="Navigasi utama">
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
                aria-label={id === "home" ? "Beranda" : id === "favorites" ? "Favorit" : "Pengaturan"}>
                <span className="relative">
                  {id === "home" && <IconHome active={isActive} />}
                  {id === "favorites" && <IconHeart filled={isActive} />}
                  {id === "settings" && <IconSettings />}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--color-teal-400)" }} />
                  )}
                </span>
                <span className="nav-label">
                  {id === "home" ? "Home" : id === "favorites" ? "Favorit" : "Setting"}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
