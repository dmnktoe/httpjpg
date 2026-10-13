"use client";

import { useSyncExternalStore } from "react";

export type PageTheme = "light" | "dark";

/**
 * Marks a portal root that restates the theme rather than sets it. Without it
 * every open overlay would read the others' mirrors (and its own) as the page's
 * theme — a feedback loop once two disagree, as in Storybook Docs where one
 * story pins `dark` and the rest follow the page.
 */
const THEME_MIRROR_ATTRIBUTE = "data-theme-mirror";

const THEME_HOST_SELECTOR = `[data-theme]:not([${THEME_MIRROR_ATTRIBUTE}])`;

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
  const observer = new MutationObserver((records) => {
    // Mirrors re-render with every overlay; they never change the answer.
    if (records.some((record) => !isThemeMirror(record.target))) {
      onStoreChange();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
    subtree: true,
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): PageTheme {
  const host = document.querySelector(THEME_HOST_SELECTOR);
  return host?.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function isThemeMirror(node: Node): boolean {
  return node instanceof Element && node.hasAttribute(THEME_MIRROR_ATTRIBUTE);
}

function getServerTheme(): PageTheme {
  return "light";
}
