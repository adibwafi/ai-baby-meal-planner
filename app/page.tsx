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
  onSaveFavorite,
  isFavorite,
}: {
  slot: typeof MEAL_SLOTS[number];
  meal: MealEntry;
  index: number;
  onSaveFavorite: (meal: MealEntry) => void;
  isFavorite: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const delayClass = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5"][index];
  const isBreakfast = slot.id === "breakfast";

  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent("Resep MPASI " + meal.name)}`;

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
          <button
            onClick={() => onSaveFavorite(meal)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: isFavorite ? "var(--color-amber-400)" : "var(--text-muted)" }}
            title="Simpan ke Folder Favorit"
          >
            <IconHeart size={16} filled={isFavorite} />
          </button>
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          id={`expand-${slot.id}`}
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center justify-between py-2.5 rounded-xl px-3 transition-all"
          style={{ background: "rgba(45,212,191,0.05)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--text-accent)", fontFamily: "var(--font-display)" }}>
            {expanded ? "Sembunyikan Resep" : "Lihat Resep Lengkap"}
          </span>
          <IconChevron size={14} open={expanded} />
        </button>

        <a
          href={tiktokSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-[rgba(255,255,255,0.08)] active:scale-95"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)"
          }}
        >
          <IconTikTok size={13} />
          <span>TikTok Video</span>
        </a>
      </div>

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

  /* ─── User Profile & Settings State ────────── */
  const [childName, setChildName] = useState("Adek");
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

  // Sync state helpers checking Supabase environment variables status
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co";

  /* ─── 1. INITIAL MOUNT LOAD DATA ─── */
  useEffect(() => {
    async function loadData() {
      // Always load profile from localstorage
      const storedName = localStorage.getItem("mpasi_childName");
      if (storedName) setChildName(storedName);

      const storedAllergies = localStorage.getItem("mpasi_allergies");
      if (storedAllergies) setAllergies(JSON.parse(storedAllergies));

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

  const saveProfileData = (name: string, allergyList: string[]) => {
    localStorage.setItem("mpasi_childName", name);
    localStorage.setItem("mpasi_allergies", JSON.stringify(allergyList));
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
      saveProfileData(childName, updated);
    }
    setNewAllergyInput("");
  }

  function removeAllergy(name: string) {
    const updated = allergies.filter((a) => a !== name);
    setAllergies(updated);
    saveProfileData(childName, updated);
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
    if (folderId === "default") return;

    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);

    const updatedFavs = favorites.map((f) => 
      f.folderId === folderId ? { ...f, folderId: "default" } : f
    );
    setFavorites(updatedFavs);

    if (isSupabaseConfigured) {
      try {
        // Safe update all affected items inside folder to default
        await supabase.from("favorite_meals").update({ folder_id: "default" }).eq("folder_id", folderId);
        // Delete the folder from table
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

  async function handleGenerate() {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setMatrix(null);
    setError(null);

    try {
      const res = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          childName,
          allergies
        }),
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

  const favoritesToShow = favorites.filter((f) => 
    activeFolderId === "default" ? true : f.folderId === activeFolderId
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "Selamat Dini Hari" :
    hour < 11 ? "Selamat Pagi" :
    hour < 15 ? "Selamat Siang" :
    hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <>
      {/* ── Scrollable Content Area ── */}
      <main
        className="flex-1 overflow-y-auto scrollbar-hide pb-28"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        {/* ─── HOME TAB ────────────────────────────────────────────────────────── */}
        {activeNav === "home" && (
          <>
            <header className="px-5 pt-6 pb-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                    {greeting}, Mama {childName} 👋
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
                Rencanakan <strong style={{ color: "var(--color-amber-300)" }}>5 menu MPASI</strong> besok. Integrasi pencarian video step-by-step TikTok disertakan!
              </p>
            </header>

            {/* Stats Bar */}
            <div className="px-5 mb-5 animate-fade-up stagger-1">
              <div className="glass rounded-2xl p-4 flex items-center justify-between gap-3">
                {[
                  { value: "5",     label: "Menu/Hari",    color: "var(--color-teal-400)"   },
                  { value: "<30",   label: "Menit Masak",  color: "var(--color-amber-300)"  },
                  { value: isSupabaseConfigured ? "Supabase" : "Local",  label: "Penyimpanan",  color: "var(--color-teal-300)"   },
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

            {/* Fridge Inventory */}
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
                  />
                  <button
                    id="add-ingredient-btn"
                    onClick={() => addIngredient(inputValue)}
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                    style={{ background: "var(--gradient-brand)" }}>
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
                        }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Generate Button */}
            <div className="px-5 mb-6 animate-fade-up stagger-3">
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

              {error && (
                <div className="mt-3 rounded-xl p-3 animate-fade-in"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <p className="text-xs text-center" style={{ color: "#fca5a5" }}>⚠️ {error}</p>
                </div>
              )}
            </div>

            {/* 5-Meal Matrix */}
            <section className="px-5 animate-fade-up stagger-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Matrix 5 Meal
                </h2>
                <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{
                    background: matrix ? "rgba(45,212,191,0.15)" : "rgba(45,212,191,0.08)",
                    color: matrix ? "var(--color-teal-400)" : "var(--text-muted)",
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
                      onSaveFavorite={handleInitiateSave}
                      isFavorite={favorites.some((f) => f.meal.name === matrix[slot.id].name)}
                    />
                  ))}
                  <p className="text-center text-[10px] pt-1 pb-2" style={{ color: "var(--text-muted)" }}>
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
          </>
        )}

        {/* ─── FAVORITES TAB ─────────────────────────────────────────────────── */}
        {activeNav === "favorites" && (
          <div className="px-5 pt-6 animate-fade-in">
            <header className="mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                Koleksi Resep
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                <span className="text-gradient-amber">Koleksi Favorit</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Kategorikan resep favorit Mama agar mudah dicari kembali saat terburu-buru.
              </p>
            </header>

            {/* Create Folder Bar */}
            <div className="rounded-2xl p-3 mb-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-xs font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Buat Folder Koleksi Baru
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Anti GTM, Khusus Pagi..."
                  className="input-field text-xs flex-1 py-2"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: "var(--gradient-brand)", color: "white" }}
                >
                  Buat
                </button>
              </div>
            </div>

            {/* Folders List (TikTok style collections) */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase mb-2.5" style={{ color: "var(--text-muted)" }}>
                Folders
              </p>
              <div className="flex flex-col gap-2">
                {folders.map((folder) => {
                  const isSelected = activeFolderId === folder.id;
                  const count = folder.id === "default" 
                    ? favorites.length 
                    : favorites.filter((f) => f.folderId === folder.id).length;

                  return (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 rounded-xl transition-all"
                      style={{
                        background: isSelected ? "rgba(251,191,36,0.08)" : "var(--bg-card)",
                        border: `1px solid ${isSelected ? "rgba(251,191,36,0.3)" : "var(--border-subtle)"}`
                      }}
                    >
                      <button
                        onClick={() => setActiveFolderId(folder.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: isSelected ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)", color: isSelected ? "var(--color-amber-300)" : "var(--text-secondary)" }}>
                          <IconFolder size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                            {folder.name}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {count} resep disimpan
                          </p>
                        </div>
                      </button>

                      {folder.id !== "default" && (
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-1 text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                          title="Hapus folder"
                        >
                          <IconClose size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Favorited Recipes List */}
            <div>
              <p className="text-xs font-bold uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Resep di Folder Ini
              </p>

              <div className="space-y-3">
                {favoritesToShow.map((fav, i) => (
                  <MealCard
                    key={fav.id}
                    slot={MEAL_SLOTS[i % MEAL_SLOTS.length]}
                    meal={fav.meal}
                    index={i}
                    onSaveFavorite={handleInitiateSave}
                    isFavorite={true}
                  />
                ))}

                {favoritesToShow.length === 0 && (
                  <div className="text-center py-8 rounded-2xl" style={{ border: "1px dashed var(--border-default)" }}>
                    <span className="text-2xl opacity-60">📂</span>
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      Belum ada resep di folder ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─────────────────────────────────────────────────── */}
        {activeNav === "settings" && (
          <div className="px-5 pt-6 animate-fade-in">
            <header className="mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                Profil
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">
                <span className="text-gradient-teal">Pengaturan</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Pengaturan nama anak dan alergi untuk penyesuaian resep otomatis.
              </p>
            </header>

            {/* Child Profile Section */}
            <section className="space-y-5">
              <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Profil Anak 👶
                </h3>

                {/* Input Name */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Nama Panggilan Anak
                  </label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={childName}
                    onChange={(e) => {
                      setChildName(e.target.value);
                      saveProfileData(e.target.value, allergies);
                    }}
                    placeholder="Contoh: Adek"
                  />
                </div>

                {/* Allergies / Ignored Ingredients */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Bahan Alergi / Dihindari
                  </label>
                  
                  {/* Allergy tag list */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {allergies.map((allergy) => (
                      <span key={allergy} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                        {allergy}
                        <button onClick={() => removeAllergy(allergy)} className="hover:text-red-400">
                          <IconClose size={10} />
                        </button>
                      </span>
                    ))}
                    {allergies.length === 0 && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Tidak ada alergi terdaftar.
                      </p>
                    )}
                  </div>

                  {/* Add Allergy input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ketik bahan alergi (cth: Udang)"
                      className="input-field text-xs flex-1 py-2"
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                    />
                    <button
                      onClick={addAllergy}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Database / Sync Settings */}
              <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Penyimpanan Database
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs py-1 border-b border-[rgba(255,255,255,0.05)]">
                    <span>Status Koneksi Supabase</span>
                    <span className="font-bold flex items-center gap-1.5" style={{ color: isSupabaseConfigured ? "var(--color-teal-400)" : "var(--color-amber-300)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: isSupabaseConfigured ? "var(--color-teal-400)" : "var(--color-amber-300)" }} />
                      {isSupabaseConfigured ? "Tersambung (Cloud)" : "Fallback (Lokal/Offline)"}
                    </span>
                  </div>

                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {isSupabaseConfigured 
                      ? "Bahan kulkas dan resep favorit disimpan secara permanen di server cloud Supabase."
                      : "Supabase belum dikonfigurasi di .env.local. Data kulkas dan favorit disimpan sementara di memori browser (localStorage) agar tetap dapat digunakan."}
                  </p>
                </div>
              </div>
            </section>
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
                Pilih Folder Koleksi
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="text-white opacity-60 hover:opacity-100">
                <IconClose size={18} />
              </button>
            </div>

            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Simpan resep <strong style={{ color: "var(--text-accent)" }}>{selectedMealForSave?.name}</strong> ke dalam folder:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide mb-4">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleConfirmSaveToFolder(folder.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{folder.name}</span>
                  <IconFolder size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
