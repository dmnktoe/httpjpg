"use client";

import { Box, Link } from "@httpjpg/ui";
import { useEffect, useState } from "react";

/**
 * Preview Mode Notification Banner
 * Shows when in draft mode with exit link
 */
export function PreviewNotification() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check for draft mode cookie
    setIsPreview(document.cookie.includes("__prerender_bypass"));
  }, []);

  if (!isPreview) {
    return null;
  }

  return (
    <Box
      css={{
        position: "fixed",
        bottom: "4",
        right: "4",
        bg: "rgba(29, 185, 84, 0.95)",
        color: "white",
        px: "4",
        py: "2",
        borderRadius: "md",
        boxShadow: "lg",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "3",
      }}
    >
      <Box as="span" css={{ fontWeight: "bold" }}>
        Preview Mode
      </Box>
      <Link
        href="/api/exit-draft"
        css={{
          color: "white",
          textDecoration: "underline",
          fontSize: "sm",
          _hover: { opacity: 0.8 },
        }}
      >
        Exit
      </Link>
    </Box>
  );
}
