"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "rw" | "fr" | "sw";
type ThemeMode = "light" | "dark" | "system";
type Accent =
  | "green" | "emerald" | "mint" | "teal" | "cyan" | "sky"
  | "blue" | "indigo" | "violet" | "purple" | "magenta" | "pink"
  | "rose" | "red" | "coral" | "orange" | "amber" | "gold"
  | "yellow" | "lime" | "olive" | "forest" | "sage" | "slate"
  | "charcoal" | "black" | "plum" | "navy" | "brick" | "copper";

const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: "green",    label: "Green (default)", color: "#34765b" },
  { id: "emerald",  label: "Emerald",          color: "#059669" },
  { id: "mint",     label: "Mint",             color: "#10b981" },
  { id: "teal",     label: "Teal",             color: "#0f766e" },
  { id: "cyan",     label: "Cyan",             color: "#0891b2" },
  { id: "sky",      label: "Sky",              color: "#0284c7" },
  { id: "blue",     label: "Blue",             color: "#2c6fa8" },
  { id: "indigo",   label: "Indigo",           color: "#4f46e5" },
  { id: "violet",   label: "Violet",           color: "#7c3aed" },
  { id: "purple",   label: "Purple",           color: "#6b3fa0" },
  { id: "magenta",  label: "Magenta",          color: "#c026d3" },
  { id: "pink",     label: "Pink",             color: "#db2777" },
  { id: "rose",     label: "Rose",             color: "#e11d48" },
  { id: "red",      label: "Red",              color: "#dc2626" },
  { id: "coral",    label: "Coral",            color: "#c94f35" },
  { id: "orange",   label: "Orange",           color: "#ea580c" },
  { id: "amber",    label: "Amber",            color: "#b07b20" },
  { id: "gold",     label: "Gold",             color: "#ca8a04" },
  { id: "yellow",   label: "Yellow",           color: "#a16207" },
  { id: "lime",     label: "Lime",             color: "#65a30d" },
  { id: "olive",    label: "Olive",            color: "#65751b" },
  { id: "forest",   label: "Forest",           color: "#166534" },
  { id: "sage",     label: "Sage",             color: "#6b8f71" },
  { id: "slate",    label: "Slate",            color: "#475569" },
  { id: "charcoal", label: "Charcoal",         color: "#374151" },
  { id: "black",    label: "Black",            color: "#111827" },
  { id: "plum",     label: "Plum",             color: "#701a75" },
  { id: "navy",     label: "Navy",             color: "#1e3a8a" },
  { id: "brick",    label: "Brick",            color: "#9f1239" },
  { id: "copper",   label: "Copper",           color: "#9a3412" },
];

const THEME_ICONS: Record<ThemeMode, string> = {
  light:  "☀",
  dark:   "☾",
  system: "⊙",
};

// Safe localStorage read — returns null during SSR
function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function SiteControls() {
  // Initialize with server-safe defaults so SSR and the initial client render
  // produce identical HTML. After mount, read localStorage and update state.
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [accent, setAccent] = useState<Accent>("green");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read persisted preferences after first render to avoid hydration mismatch
  useEffect(() => {
    const savedLanguage = lsGet("inzuhub-language") as Language | null;
    const savedTheme    = lsGet("inzuhub-theme")    as ThemeMode | null;
    const savedAccent   = lsGet("inzuhub-accent")   as Accent | null;
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme)    setTheme(savedTheme);
    if (savedAccent)   setAccent(savedAccent);
    setMounted(true);
  }, []);

  const languageMenu = useRef<HTMLDetailsElement>(null);
  const paletteRef   = useRef<HTMLDivElement>(null);

  // ── Persist + broadcast language ────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("inzuhub-language", language); } catch { /* */ }
    window.dispatchEvent(new CustomEvent("inzuhub:language", { detail: language }));
  }, [language, mounted]);

  // ── Persist + apply theme ────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("inzuhub-theme", theme); } catch { /* */ }
    document.documentElement.dataset.theme = theme;

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        window.dispatchEvent(new CustomEvent("inzuhub:theme-resolved", {
          detail: mq.matches ? "dark" : "light",
        }));
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  // ── Persist + apply accent ───────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("inzuhub-accent", accent); } catch { /* */ }
    if (accent === "green") {
      delete document.documentElement.dataset.accent;
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--accent-alt");
    } else {
      document.documentElement.dataset.accent = accent;
      const selectedColor = ACCENTS.find((item) => item.id === accent)?.color ?? "#34765b";
      document.documentElement.style.setProperty("--accent", selectedColor);
      document.documentElement.style.setProperty("--accent-alt", selectedColor);
    }
  }, [accent, mounted]);

  // ── Close language menu on outside click ─────────────────────
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (languageMenu.current && !languageMenu.current.contains(e.target as Node)) {
        languageMenu.current.open = false;
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  // ── Close palette on outside click ──────────────────────────
  useEffect(() => {
    if (!paletteOpen) return;
    const close = (e: PointerEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [paletteOpen]);

  const toggleTheme = () => {
    // Treat the system default as light for the first explicit toggle so dark mode is one click away.
    setTheme((cur) => cur === "dark" ? "light" : "dark");
  };

  const currentColor = ACCENTS.find((a) => a.id === accent)?.color ?? "#34765b";

  return (
    <>
      {/* Language picker */}
      <details ref={languageMenu} className="language">
        <summary aria-label="Choose language" title="Choose language">
          <span aria-hidden="true">🌐</span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div>
          {(["en", "rw", "fr", "sw"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLanguage(code);
                if (languageMenu.current) languageMenu.current.open = false;
              }}
            >
              {code === "en" ? "English"
               : code === "rw" ? "Kinyarwanda"
               : code === "fr" ? "Français"
               : "Swahili"}
            </button>
          ))}
        </div>
      </details>

      {/* Accent colour — single dot trigger, palette appears below */}
      <div
        ref={paletteRef}
        className={`accent-picker${paletteOpen ? " open" : ""}`}
      >
        <button
          type="button"
          className="accent-trigger"
          style={{ background: currentColor }}
          aria-label={`Accent colour: ${accent}. Click to change.`}
          title="Change accent colour"
          onClick={() => setPaletteOpen((o) => !o)}
        />
        <div className="accent-palette" role="listbox" aria-label="Choose accent colour">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="option"
              aria-selected={accent === a.id}
              className={`accent-swatch${accent === a.id ? " active" : ""}`}
              style={{ background: a.color }}
              aria-label={a.label}
              title={a.label}
              onClick={() => { setAccent(a.id); setPaletteOpen(false); }}
            />
          ))}
        </div>
      </div>

      {/* Theme toggle: one click switches directly between light and dark. */}
      <button
        type="button"
        className="theme-button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={toggleTheme}
      >
        <span aria-hidden="true">{theme === "dark" ? THEME_ICONS.dark : THEME_ICONS.light}</span>
        <small>{theme === "dark" ? "Dark" : "Light"}</small>
      </button>
    </>
  );
}
