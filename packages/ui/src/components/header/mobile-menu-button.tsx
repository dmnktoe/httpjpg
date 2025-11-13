"use client";

import { Box } from "../box/box";

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Mobile Menu Toggle Button
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
      <Box css={{ display: "flex", flexDirection: "row", gap: "3" }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            padding: "0.75rem",
            color: "white",
            transition: "all 200ms",
            border: "none",
            cursor: "pointer",
          }}
          className="hover:scale-95 hover:bg-black active:scale-75 active:bg-neutral-700"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "inherit" }}
            aria-hidden="true"
          >
            <path
              d="M2 3h12M2 8h12M2 13h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </Box>
    </Box>
  );
};

MobileMenuButton.displayName = "MobileMenuButton";
