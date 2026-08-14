"use client";

import { useEffect, useState } from "react";

export type PageTheme = "light" | "dark";

/**
 * Reads the page's `data-theme` — the attribute Panda's `_pageDark` condition
 * (`[data-theme=dark] &`) keys off.
 *
 * Overlays portal into `document.body`, which puts them outside whichever
 * element carries the attribute: `<html>` in the app, a decorator `<div>` in
 * Storybook. Mirroring the value onto the portal root is what keeps `pageBg`
 * and friends resolving to the same theme as the page behind the overlay.
 */
export function usePageTheme(override?: PageTheme): PageTheme {
  const [theme, setTheme] = useState<PageTheme>(override ?? "light");

  useEffect(() => {
    if (override) {
      setTheme(override);
      return;
    }

    const read = () => {
      // First match wins: `<html>` in the app, the decorator wrapper in
      // Storybook. Only one of them is ever present.
      const host = document.querySelector("[data-theme]");
      setTheme(host?.getAttribute("data-theme") === "dark" ? "dark" : "light");
    };

    read();

    // Subtree, because the element carrying the attribute is not always the
    // root — a theme toggle has to reach a lightbox that is already open.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [override]);

  return theme;
}
