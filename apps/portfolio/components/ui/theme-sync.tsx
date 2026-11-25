"use client";

import { applyPageScale, applyWorkAccent, type PageScale } from "@httpjpg/ui";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ThemeSyncProps {
  theme: "light" | "dark";
  /** Work page Project Accent Color (`#RGB` / `#RRGGBB`). Cleared when omitted. */
  accent?: string | null;
  scale?: PageScale | null;
}

export function ThemeSync({ theme, accent, scale }: ThemeSyncProps) {
  const desktop = scale?.desktop;
  const tablet = scale?.tablet;
  const mobile = scale?.mobile;

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    applyWorkAccent(root, accent, theme === "dark");
    const scaled = Boolean(desktop && tablet && mobile);
    applyPageScale(root, desktop && tablet && mobile ? { desktop, tablet, mobile } : null);
    if (!scaled) {
      return;
    }
    return () => applyPageScale(root, null);
  }, [theme, accent, desktop, tablet, mobile]);
  return null;
}
