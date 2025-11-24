"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Preview Notification Banner
 *
 * Shows a banner when draft mode is active
 * Provides link to exit draft mode
 */
export function PreviewNotification() {
  const [isPreview, setIsPreview] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're in draft mode
    const isDraftMode = document.cookie.includes("__prerender_bypass");
    const hasStoryblokParam = searchParams?.has("_storyblok");
    const hasDraftParam = searchParams?.has("_draft");

    setIsPreview(isDraftMode || hasStoryblokParam || hasDraftParam);
  }, [pathname, searchParams]);

  if (!isPreview) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "#fbbf24",
        color: "#000",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <span>🔍 Preview Mode aktiv – Du siehst unveröffentlichte Inhalte</span>
      <a
        href="/api/exit-draft"
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "4px",
          textDecoration: "none",
          fontSize: "13px",
        }}
      >
        Beenden
      </a>
    </div>
  );
}
