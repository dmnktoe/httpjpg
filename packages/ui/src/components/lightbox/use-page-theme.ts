"use client";

import { useEffect, useState } from "react";

export type PageTheme = "light" | "dark";

export function usePageTheme(override?: PageTheme): PageTheme {
  const [theme, setTheme] = useState<PageTheme>(override ?? "light");

  useEffect(() => {
    if (override) {
      setTheme(override);
      return;
    }

    const read = () => {
      const host = document.querySelector("[data-theme]");
      setTheme(host?.getAttribute("data-theme") === "dark" ? "dark" : "light");
    };

    read();

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
