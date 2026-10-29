"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  useEffect(() => {
    const root = document.documentElement;

    const readSavedTheme = (): "light" | "dark" | null => {
      try {
        const saved = window.localStorage.getItem("theme");
        return saved === "light" || saved === "dark" ? saved : null;
      } catch {
        return null;
      }
    };

    // Dark is the product default. Only an explicit saved choice overrides it.
    const initialTheme = readSavedTheme() ?? "dark";
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
    root.style.colorScheme = initialTheme;
    root.dataset.themeReady = "true";
    setThemeState(initialTheme);
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      document.documentElement.style.colorScheme = newTheme;
      document.documentElement.dataset.themeReady = "true";
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
