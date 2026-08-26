"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface LocaleSyncProps {
  lang: string;
}

export function LocaleSync({ lang }: LocaleSyncProps) {
  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = lang;
    return () => {
      html.lang = previous;
    };
  }, [lang]);
  return null;
}
