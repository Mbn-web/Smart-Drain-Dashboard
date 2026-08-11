// useTheme — light/dark theme context with localStorage persistence.
//
// The dark theme is the app's default (Smart Drain AI dark navy / cyan
// technical aesthetic). Users can switch to light mode; the selection is
// persisted to localStorage under `smart-drain-theme` and re-applied on
// subsequent visits.
//
// Applies `.dark` / `.light-theme` classes to <html> so global CSS
// overrides (see index.css) can restyle the shell in one place instead
// of touching every JSX className.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "smart-drain-theme";
const ThemeContext = createContext({
  theme: "dark",
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function readInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (_e) {
    /* ignore */
  }
  return "dark";
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light-theme");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  } else {
    root.classList.add("dark");
    root.classList.remove("light-theme");
    root.setAttribute("data-theme", "dark");
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_e) {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = {
    theme,
    isLight: theme === "light",
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
