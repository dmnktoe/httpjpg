"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ThemeSyncProps {
  theme: "light" | "dark";
}

export function ThemeSync({ theme }: ThemeSyncProps) {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
