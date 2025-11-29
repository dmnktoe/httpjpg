"use client";

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
  return (
    <Box
      css={{
        position: { base: "fixed", md: "relative" },
        right: { base: "2", md: "auto" },
        top: { base: "3", md: "auto" },
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
          p: "2 3",
          cursor: "pointer",
          fontFamily: "Impact, Haettenschweiler, sans-serif",
          fontSize: "xs",
          lineHeight: "none",
          letterSpacing: "wider",
          transition: "opacity 150ms ease-in-out",
          _hover: { opacity: 0.5 },
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Box as="span" css={{ mb: "0.15rem" }}>
          ╔═══╗
        </Box>
        <Box as="span" css={{ mb: "0.15rem" }}>
          ║ ☰ ║
        </Box>
        <Box as="span">╚═══╝</Box>
      </Box>
    </Box>
  );
};

MobileMenuButton.displayName = "MobileMenuButton";
