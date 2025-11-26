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
        display: { base: "block", xl: "none" },
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          color: "black",
          border: "none",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontFamily: "Impact, Haettenschweiler, sans-serif",
          fontSize: "0.65rem",
          lineHeight: "none", // token: typography.lineHeight.none (1)
          letterSpacing: "wider", // token: typography.letterSpacing.wider (0.05em)
          transition: "opacity 150ms ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <span style={{ marginBottom: "0.15rem" }}>╔═══╗</span>
        <span style={{ marginBottom: "0.15rem" }}>║ ☰ ║</span>
        <span>╚═══╝</span>
      </button>
    </Box>
  );
};

MobileMenuButton.displayName = "MobileMenuButton";
