"use client";

import { useEffect } from "react";

export interface ThemeSyncProps {
  theme: "light" | "dark";
}

/**
 * Keeps `<html data-theme>` in sync on client-side navigations.
 * The root layout only renders once per session, so soft nav doesn't
 * reset the attribute by itself.
 */
export function ThemeSync({ theme }: ThemeSyncProps) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
