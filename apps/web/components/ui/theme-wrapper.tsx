"use client";

import { type ReactNode, useEffect } from "react";

interface ThemeWrapperProps {
  isDark: boolean;
  children: ReactNode;
}

/**
 * ThemeWrapper - Wraps page content with theme data attribute
 * This allows the page and its container to respond to theme settings
 * Dispatches theme change event to update header/footer
 */
export function ThemeWrapper({ isDark, children }: ThemeWrapperProps) {
  useEffect(() => {
    // Dispatch theme change event immediately to update header/footer
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { isDark } }),
    );
  }, [isDark]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      style={{
        backgroundColor: isDark ? "#000000" : "#ffffff",
        color: isDark ? "#ffffff" : "#000000",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
