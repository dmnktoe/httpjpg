"use client";

import { applyWorkAccent } from "@httpjpg/ui";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ThemeSyncProps {
  theme: "light" | "dark";
  /** Work page Project Accent Color (`#RGB` / `#RRGGBB`). Cleared when omitted. */
  accent?: string | null;
}

export function ThemeSync({ theme, accent }: ThemeSyncProps) {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    applyWorkAccent(root, accent, theme === "dark");
  }, [theme, accent]);
  return null;
}
