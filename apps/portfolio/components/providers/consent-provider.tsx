"use client";

import { CookieBanner } from "@httpjpg/consent";
import { useEffect, useState } from "react";

/**
 * Cookie banner entry point. Hidden inside iframes: CSP only allows framing by
 * Storyblok, and the Visual Editor often reloads without `_storyblok*` params
 * (so the server-side gate in `layout.tsx` alone is not enough).
 */
export function ConsentProvider() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (window.self === window.top) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return <CookieBanner />;
}
