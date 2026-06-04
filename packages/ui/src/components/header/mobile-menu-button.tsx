"use client";

import { useEffect } from "react";

import { Box } from "../box/box";

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function MobileMenuButton({ isOpen, setIsOpen }: MobileMenuButtonProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <Box
      css={{
        display: { base: "flex", lg: "none" },
        flexShrink: 0,
        pointerEvents: "auto",
      }}
    >
      <Box
        as="button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        css={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minW: "12",
          minH: "12",
          p: "2",
          color: "pageFg",
          fontFamily: "monospace",
          fontSize: "sm",
          fontWeight: "bold",
          lineHeight: "1",
          letterSpacing: "tight",
          bg: "transparent",
          border: "none",
          transition: "all 150ms ease-out",
          cursor: "pointer",
          _hover: { opacity: 0.6 },
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <>
            <Box as="span">✦━━━✦</Box>
            <Box as="span">━╳━╳━</Box>
            <Box as="span">✦━━━✦</Box>
          </>
        ) : (
          <>
            <Box as="span">◆━━━━</Box>
            <Box as="span">━━━━◆</Box>
            <Box as="span">◆━━━━</Box>
          </>
        )}
      </Box>
    </Box>
  );
}

MobileMenuButton.displayName = "MobileMenuButton";
