"use client";

import { Box } from "../box/box";
import { LightboxButton } from "./lightbox-button";

interface LightboxBarProps {
  current: number;
  total: number;
  hasNavigation: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxBar({
  current,
  total,
  hasNavigation,
  onClose,
  onPrev,
  onNext,
}: LightboxBarProps) {
  return (
    <Box
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "2",
        px: "2",
        borderColor: "pageBorder",
        borderBottom: "1px solid",
      }}
    >
      <Box
        as="span"
        aria-live="polite"
        css={{
          px: "2",
          opacity: 0.7,
          fontFamily: "mono",
          fontSize: "xs",
          letterSpacing: "0.15em",
          userSelect: "none",
        }}
      >
        {hasNavigation
          ? `[ ${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")} ]`
          : "[ 01 ]"}
      </Box>

      <Box css={{ display: "flex", alignItems: "center" }}>
        {hasNavigation && (
          <>
            <LightboxButton aria-label="Previous image" onClick={onPrev}>
              [ ← ]
            </LightboxButton>
            <LightboxButton aria-label="Next image" onClick={onNext}>
              [ → ]
            </LightboxButton>
          </>
        )}
        <LightboxButton aria-label="Close image viewer" onClick={onClose}>
          [ esc ]
        </LightboxButton>
      </Box>
    </Box>
  );
}
