import { useEffect, useState } from "react";

export type FontSize = "sm" | "default" | "lg" | "xl";

export interface A11yPrefs {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = "a11y-prefs";

const FONT_SIZE_CLASSES: FontSize[] = ["sm", "default", "lg", "xl"];

function getDefaultPrefs(): A11yPrefs {
  return {
    fontSize: "default",
    highContrast: window.matchMedia("(prefers-contrast: more)").matches,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
      const defaults = getDefaultPrefs();
      return {
        fontSize: FONT_SIZE_CLASSES.includes(parsed.fontSize as FontSize)
          ? (parsed.fontSize as FontSize)
          : defaults.fontSize,
        highContrast:
          typeof parsed.highContrast === "boolean"
            ? parsed.highContrast
            : defaults.highContrast,
        reduceMotion:
          typeof parsed.reduceMotion === "boolean"
            ? parsed.reduceMotion
            : defaults.reduceMotion,
      };
    }
  } catch {
    // ignore malformed storage
  }
  return getDefaultPrefs();
}

export function applyA11yPrefs(prefs: A11yPrefs) {
  const root = document.documentElement;

  // Font size — remove all size classes then apply the active one
  root.classList.remove("font-size-sm", "font-size-lg", "font-size-xl");
  if (prefs.fontSize !== "default") {
    root.classList.add(`font-size-${prefs.fontSize}`);
  }

  // High contrast
  if (prefs.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  // Reduce motion
  if (prefs.reduceMotion) {
    root.classList.add("reduce-motion");
  } else {
    root.classList.remove("reduce-motion");
  }
}

/** Call once at app root before first render — mirrors initDarkMode() */
export function initA11yPrefs() {
  applyA11yPrefs(loadPrefs());
}

export function useA11yPrefs() {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs);

  useEffect(() => {
    applyA11yPrefs(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  function setFontSize(fontSize: FontSize) {
    setPrefs((p) => ({ ...p, fontSize }));
  }

  function setHighContrast(highContrast: boolean) {
    setPrefs((p) => ({ ...p, highContrast }));
  }

  function setReduceMotion(reduceMotion: boolean) {
    setPrefs((p) => ({ ...p, reduceMotion }));
  }

  return { prefs, setFontSize, setHighContrast, setReduceMotion };
}
