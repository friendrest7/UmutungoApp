"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "rw" | "fr" | "sw";
type ThemeMode = "light" | "dark" | "system";

function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function SiteControls() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);
  const languageMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const savedLanguage = lsGet("inzuhub-language") as Language | null;
    const savedTheme = lsGet("inzuhub-theme") as ThemeMode | null;
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("inzuhub-language", language); } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent("inzuhub:language", { detail: language }));
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("inzuhub-theme", theme); } catch { /* storage unavailable */ }
    document.documentElement.dataset.theme = theme;

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => window.dispatchEvent(new CustomEvent("inzuhub:theme-resolved", {
        detail: media.matches ? "dark" : "light",
      }));
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (languageMenu.current && !languageMenu.current.contains(event.target as Node)) {
        languageMenu.current.open = false;
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  return (
    <>
      <details ref={languageMenu} className="language">
        <summary aria-label="Choose language" title="Choose language">
          <span aria-hidden="true">◎</span>
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
              {code === "en" ? "English" : code === "rw" ? "Kinyarwanda" : code === "fr" ? "Français" : "Swahili"}
            </button>
          ))}
        </div>
      </details>

      <button
        type="button"
        className="theme-button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={toggleTheme}
      >
        <span aria-hidden="true">{theme === "dark" ? "◐" : "☼"}</span>
        <small>{theme === "dark" ? "Dark" : "Light"}</small>
      </button>
    </>
  );
}
