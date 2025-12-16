"use client";

import { Box } from "@httpjpg/ui";
import { useMemo } from "react";

export interface ConsentPlaceholderProps {
  /**
   * Vendor name (YouTube, Vimeo, Spotify, SoundCloud)
   */
  vendor: string;
  /**
   * Placeholder height
   */
  height?: string | number;
  /**
   * Custom message
   */
  message?: string;
}

/**
 * ConsentPlaceholder - Shows when external content blocked by consent
 *
 * Displays an ASCII-styled message when external media (YouTube, Vimeo, Spotify, SoundCloud)
 * is blocked due to missing consent. Matches brutalist portfolio aesthetic.
 *
 * @example
 * ```tsx
 * <ConsentPlaceholder vendor="YouTube" height="400px" />
 * ```
 */
export function ConsentPlaceholder({
  vendor,
  height = "400px",
  message,
}: ConsentPlaceholderProps) {
  const defaultMessage = useMemo(
    () => `･ﾟ⋆ ${vendor} Content Blocked ･ﾟ⋆
    
This ${vendor} embed requires your consent to load external content.
    
Please accept Media & External Services in the cookie banner to view this content.`,
    [vendor],
  );

  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: typeof height === "number" ? `${height}px` : height,
        padding: "6",
        background: "neutral.50",
        border: "2px dashed",
        borderColor: "neutral.300",
        borderRadius: "sm",
        textAlign: "center",
        fontFamily: "mono",
        fontSize: "sm",
        color: "neutral.600",
        whiteSpace: "pre-line",
      }}
    >
      <div>{message || defaultMessage}</div>
    </Box>
  );
}
