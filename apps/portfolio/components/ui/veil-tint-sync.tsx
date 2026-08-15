"use client";

import { useEffect, useLayoutEffect } from "react";

import { PAGE_VEIL_RGB_VAR, resolveVeilTint } from "@/lib/page-accent";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface VeilTintSyncProps {
  /** Design-token hex from the work blok's `accentColor`. Omit to clear. */
  color?: string | null;
}

/**
 * Writes `--page-veil-rgb` on `<html>` so `HeaderScrollVeil` can tint itself.
 * Same role as `ThemeSync` for `data-theme`.
 */
export function VeilTintSync({ color }: VeilTintSyncProps) {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const rgb = resolveVeilTint(color);
    if (rgb) {
      root.style.setProperty(PAGE_VEIL_RGB_VAR, rgb);
    } else {
      root.style.removeProperty(PAGE_VEIL_RGB_VAR);
    }
  }, [color]);

  return null;
}
