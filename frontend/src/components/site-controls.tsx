"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "rw" | "fr" | "sw";
type ThemeMode = "light" | "dark" | "system";
type Accent    = "green" | "coral" | "blue" | "amber" | "purple";

const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: "green",  label: "Green (default)", color: "#34765b" },
  { id: "coral",  label: "Coral",           color: "#c94f35" },
  { id: "blue",   label: "Blue",            color: "#2c6fa8" },
  { id: "amber",  label: "Amber",           color: "#b07b20" },
  { id: "purple", label: "Purple",          color: "#6b3fa0" },
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
    } else {
      document.documentElement.dataset.accent = accent;
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

  const cycleTheme = () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    setTheme((cur) => order[(order.indexOf(cur) + 1) % order.length]);
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

      {/* Theme toggle (cycles light → dark → system) */}
      <button
        type="button"
        className="theme-button"
        aria-label={`Theme: ${theme}. Click to switch.`}
        title={`Theme: ${theme}`}
        onClick={cycleTheme}
      >
        {THEME_ICONS[theme]}
      </button>
    </>
  );
}
