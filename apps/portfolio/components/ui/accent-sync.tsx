"use client";

import { extractVibrantColor } from "@httpjpg/spotify";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** CSS custom properties stamped onto `<html>` for work-page accents. */
const ACCENT_VARS = ["--page-accent", "--page-accent-fg", "--accent-of-day"] as const;

export interface AccentSyncProps {
  /**
   * CORS-enabled image URL to sample (Storyblok thumb of the featured work
   * image). Omit or pass empty to clear any previous page accent.
   */
  imageUrl?: string;
}

/**
 * Samples the work's featured image and writes accent CSS variables on
 * `<html>`, the same way `ThemeSync` owns `data-theme`. Cleared on unmount so
 * a client navigation off a work page does not leave a stale tint behind.
 */
export function AccentSync({ imageUrl }: AccentSyncProps) {
  useIsomorphicLayoutEffect(() => {
    if (!imageUrl) {
      clearAccentVars();
      return;
    }

    let cancelled = false;

    extractVibrantColor(imageUrl).then((color) => {
      if (cancelled || !color) {
        return;
      }
      const root = document.documentElement;
      root.style.setProperty("--page-accent", color.css);
      root.style.setProperty("--page-accent-fg", color.textColor);
      root.style.setProperty("--accent-of-day", color.css);
    });

    return () => {
      cancelled = true;
      clearAccentVars();
    };
  }, [imageUrl]);

  return null;
}

function clearAccentVars(): void {
  const root = document.documentElement;
  for (const name of ACCENT_VARS) {
    root.style.removeProperty(name);
  }
}
