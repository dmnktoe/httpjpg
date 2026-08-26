"use client";

import { CookieBanner } from "@httpjpg/consent";
import { useSyncExternalStore } from "react";

/**
 * Cookie banner entry point. Hidden inside iframes: CSP only allows framing by
 * Storyblok, and the Visual Editor often reloads without `_storyblok*` params
 * (so the server-side gate in `layout.tsx` alone is not enough).
 */
export function ConsentProvider() {
  const showBanner = useSyncExternalStore(subscribeNever, getIsTopWindow, getServerFalse);

  if (!showBanner) {
    return null;
  }

  return <CookieBanner />;
}

function subscribeNever() {
  return () => {};
}

function getIsTopWindow() {
  return window.self === window.top;
}

function getServerFalse() {
  return false;
}
