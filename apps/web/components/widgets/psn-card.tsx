"use client";

import { Image } from "@httpjpg/ui";
import { useEffect, useState } from "react";

export interface PSNCardProps {
  /**
   * PSN username
   */
  username?: string;
}

/**
 * A fixed PSN profile card widget
 *
 * @example
 * ```tsx
 * <PSNCard username="bullensohn6" />
 * ```
 */
export const PSNCard = ({ username = "bullensohn6" }: PSNCardProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cardUrl = `https://card.psnprofiles.com/1/${username}.png`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        width: "300px",
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
    </div>
  );
};
