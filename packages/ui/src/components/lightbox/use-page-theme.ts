"use client";

import { useSyncExternalStore } from "react";

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
  const observed = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerTheme);
  return override ?? observed;
}

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
    subtree: true,
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): PageTheme {
  const host = document.querySelector("[data-theme]");
  return host?.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerTheme(): PageTheme {
  return "light";
}
