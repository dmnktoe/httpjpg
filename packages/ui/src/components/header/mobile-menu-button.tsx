"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Box } from "../box/box";

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenuButton = ({ isOpen, setIsOpen }: MobileMenuButtonProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const button = (
    <Box
      css={{
        position: "fixed",
        right: "4",
        top: "4",
        zIndex: "mobileMenuButton",
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
          color: "pageFg",
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

  if (!mounted) {
    return null;
  }

  return createPortal(button, document.body);
};

MobileMenuButton.displayName = "MobileMenuButton";
