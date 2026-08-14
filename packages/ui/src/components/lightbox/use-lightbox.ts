"use client";

import { useCallback, useState } from "react";

export interface UseLightboxResult {
  open: boolean;
  index: number;
  openAt: (index: number) => void;
  close: () => void;
  setIndex: (index: number) => void;
}

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
