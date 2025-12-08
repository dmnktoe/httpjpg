"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider - Manages theme state for the application
 * Listens to theme changes from pages and updates header/footer accordingly
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Listen for theme change events from pages
    const handleThemeChange = (event: CustomEvent<{ isDark: boolean }>) => {
      setIsDark(event.detail.isDark);
      // Also update body attribute for CSS targeting
      document.body.setAttribute(
        "data-theme",
        event.detail.isDark ? "dark" : "light",
      );
    };

    window.addEventListener(
      "themeChange" as any,
      handleThemeChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "themeChange" as any,
        handleThemeChange as EventListener,
      );
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark }}>{children}</ThemeContext.Provider>
  );
}
