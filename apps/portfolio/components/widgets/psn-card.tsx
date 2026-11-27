"use client";

import { FloatingWidget, Image, useHasMounted } from "@httpjpg/ui";

export interface PSNCardProps {
  username?: string;
}

const FLOATING_QUERY = "(min-width: 64rem)";

export function PSNCard({ username }: PSNCardProps) {
  const mounted = useHasMounted();

  if (!mounted || !username) {
    return null;
  }

  const cardUrl = `https://card.psnprofiles.com/1/${username}.png`;

  return (
    <FloatingWidget
      data-psn-card=""
      floatingQuery={FLOATING_QUERY}
      css={{
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "widget",
        display: "none",
        w: "15.625rem",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
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
          transform: "rotate(2deg)",
        }}
        draggable={false}
      />
    </FloatingWidget>
  );
}
