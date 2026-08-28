"use client";

import { Box, Image, useHasMounted } from "@httpjpg/ui";

export interface PSNCardProps {
  username?: string;
}

export function PSNCard({ username }: PSNCardProps) {
  const mounted = useHasMounted();

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
        zIndex: "widget",
        display: "none",
        width: "250px",
        lg: { display: "block" },
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
}
