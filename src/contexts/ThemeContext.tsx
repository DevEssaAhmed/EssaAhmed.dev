"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const hasExplicitPreference = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const readSavedTheme = () => {
      try {
        const saved = localStorage.getItem("theme");
        return saved === "light" || saved === "dark" ? saved : null;
      } catch {
        return null;
      }
    };
    const applyTheme = (initial: "light" | "dark") => {
      setThemeState(initial);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initial);
      document.documentElement.style.colorScheme = initial;
    };

    const saved = readSavedTheme();
    hasExplicitPreference.current = saved !== null;
    applyTheme(saved || (media.matches ? "dark" : "light"));

    const followSystemPreference = (event: MediaQueryListEvent) => {
      if (!hasExplicitPreference.current && !readSavedTheme()) {
        applyTheme(event.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", followSystemPreference);
    return () => media.removeEventListener("change", followSystemPreference);
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    hasExplicitPreference.current = true;
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      document.documentElement.style.colorScheme = newTheme;
      try {
        localStorage.setItem("theme", newTheme);
      } catch {
        // ignore
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
