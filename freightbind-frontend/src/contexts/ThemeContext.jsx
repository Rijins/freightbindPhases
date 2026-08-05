import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getStoredTheme,
  getSystemTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from "../utils/themeTokens";

const TRANSITION_DURATION = 250;

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

// Flash a short CSS transition so colors cross-fade instead of snapping.
const applyThemeTransition = () => {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  window.setTimeout(() => root.classList.remove("theme-switching"), TRANSITION_DURATION + 50);
};

// Single synchronous entry point for making a theme "live" on <html>:
// the Tailwind `dark` class, an explicit `data-theme` attribute, and the
// CSS `color-scheme` hint (native scrollbars/controls follow the app).
const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

/**
 * App-wide theme state. The `dark` class is pre-applied by an inline script
 * in index.html (before first paint — no flash), so this provider only
 * keeps state in sync, persists explicit user choices, and applies changes
 * immediately (synchronously in the toggle handler, not just via effects).
 *
 * Precedence: Manual choice > Saved theme > System theme.
 * - toggleTheme() always wins and persists.
 * - The OS listener only reacts when no saved preference exists.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Follow the OS when the user has not chosen a theme explicitly.
  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      if (!getStoredTheme()) setTheme(event.matches ? "dark" : "light");
    };
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  // Keep other open tabs in sync when one of them changes the theme.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    applyThemeTransition();
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private/embedded contexts — never crash.
    }
    // Apply synchronously so the click always has an immediate effect,
    // independent of React's render/effect timing.
    applyThemeToDocument(next);
    setTheme(next);
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
