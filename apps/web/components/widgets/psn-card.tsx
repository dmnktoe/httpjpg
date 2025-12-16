"use client";

import { Box, Image } from "@httpjpg/ui";
import { useEffect, useState } from "react";

export interface PSNCardProps {
  /**
   * PSN username
   */
  username?: string;
}

/**
 * A fixed PSN profile card widget
 * Only visible on desktop (lg breakpoint and above)
 *
 * @example
 * ```tsx
 * <PSNCard username="your-psn-username" />
 * ```
 */
export const PSNCard = ({ username }: PSNCardProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !username) {
    return null;
  }

  const cardUrl = `https://card.psnprofiles.com/1/${username}.png`;

  return (
    <Box
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        width: "250px",
        display: "none",
        lg: {
          display: "block",
        },
      }}
    >
      <Image
        src={cardUrl}
        alt={`PSN Profile: ${username}`}
        css={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
        draggable={false}
      />
    </Box>
  );
};
