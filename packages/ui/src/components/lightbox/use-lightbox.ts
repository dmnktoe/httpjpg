"use client";

import { useCallback, useState } from "react";

export interface UseLightboxResult {
  open: boolean;
  index: number;
  /** Opens the lightbox on a given item. */
  openAt: (index: number) => void;
  close: () => void;
  setIndex: (index: number) => void;
}

/**
 * Owns the open/index state a `Lightbox` is driven by.
 *
 * `Lightbox` itself is controlled and presentational — same split as
 * `CommandPalette` / `AskWidget` — so it stays renderable in Storybook and
 * tests. This hook is the other half, for callers that just want a gallery.
 */
export function useLightbox(): UseLightboxResult {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const openAt = useCallback((next: number) => {
    setIndex(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, index, openAt, close, setIndex };
}
