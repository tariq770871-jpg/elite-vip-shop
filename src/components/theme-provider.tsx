"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Priority: saved preference > system preference > default light
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial: Theme = stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  // Listen for cross-tab theme changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Listen for system theme changes (when no explicit preference is saved)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set an explicit preference
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
