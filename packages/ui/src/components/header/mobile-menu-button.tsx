"use client";

import { useEffect } from "react";
import { Box } from "../box/box";

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Mobile Menu Toggle Button with Brutalist ASCII Style
 */
export const MobileMenuButton = ({
  isOpen,
  setIsOpen,
}: MobileMenuButtonProps) => {
  // Lock body scroll when menu is open
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
        position: { base: "fixed", md: "relative" },
        right: { base: "4", md: "auto" },
        top: { base: "4", md: "auto" },
        zIndex: 65,
        ml: "auto",
        display: { base: "block", lg: "none" },
      }}
    >
      <Box
        as="button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bg: "transparent",
          color: "black",
          border: "none",
          p: "2",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "sm",
          lineHeight: "1",
          fontWeight: "bold",
          letterSpacing: "tight",
          minW: "12",
          minH: "12",
          transition: "all 150ms ease-out",
          _hover: {
            opacity: 0.6,
          },
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
};

MobileMenuButton.displayName = "MobileMenuButton";
