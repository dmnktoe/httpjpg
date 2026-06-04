"use client";

import { Box } from "@httpjpg/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PreviewNotificationContent() {
  const [isPreview, setIsPreview] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
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
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: "previewBadge",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        padding: 3,
        color: "black",
        fontSize: "md",
        fontWeight: "medium",
        backgroundColor: "warning.200",
        boxShadow: "md",
      }}
    >
      <Box as="span">🔍 Preview Mode aktiv – Du siehst unveröffentlichte Inhalte</Box>
      <Box
        as="a"
        href="/api/exit-draft"
        css={{
          px: 3,
          py: 1.5,
          color: "white",
          fontSize: "sm",
          fontWeight: "medium",
          textDecoration: "none",
          bg: "black",
          borderRadius: "2xl",
          _hover: { opacity: 90 },
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
