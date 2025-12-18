"use client";

import { Box } from "@httpjpg/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Preview Notification Banner
 *
 * Shows a banner when draft mode is active
 * Provides link to exit draft mode
 */
function PreviewNotificationContent() {
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
    <Box
      css={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: "preview",
        backgroundColor: "warning.200",
        color: "black",
        padding: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        fontSize: "md",
        fontWeight: "medium",
        boxShadow: "md",
      }}
    >
      <Box as="span">
        🔍 Preview Mode aktiv – Du siehst unveröffentlichte Inhalte
      </Box>
      <Box
        as="a"
        href="/api/exit-draft"
        css={{
          bg: "black",
          color: "white",
          px: 3,
          py: 1.5,
          borderRadius: "2xl",
          textDecoration: "none",
          fontSize: "sm",
          fontWeight: "medium",
          _hover: {
            opacity: 90,
          },
        }}
      >
        Beenden
      </Box>
    </Box>
  );
}

export function PreviewNotification() {
  return (
    <Suspense fallback={null}>
      <PreviewNotificationContent />
    </Suspense>
  );
}
