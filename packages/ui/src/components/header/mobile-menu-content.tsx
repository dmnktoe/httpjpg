"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Box } from "../box/box";
import type { HeaderProps } from "./header";
import { MobileMenuBackdrop } from "./mobile-menu-backdrop";
import { MobileMenuNavRibbon } from "./mobile-menu-nav-ribbon";
import { MobileMenuWorkSection } from "./mobile-menu-work-section";

interface MobileMenuContentProps extends Omit<HeaderProps, "children"> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenuContent = ({
  isOpen,
  setIsOpen,
  nav,
  personalWork = [],
  clientWork = [],
}: MobileMenuContentProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const menu = (
    <Box
      css={{
        position: "fixed",
        inset: 0,
        zIndex: "mobileMenu",
        display: { base: "flex", lg: "none" },
        maxH: "100dvh",
        w: "full",
        maxW: "full",
        flexDirection: "row",
        justifyContent: { md: "end" },
        transition: `opacity 200ms ease-in-out, visibility 0s linear ${isOpen ? "0s" : "200ms"}`,
        visibility: isOpen ? "visible" : "hidden",
        opacity: isOpen ? 1 : 0,
      }}
    >
      {isOpen && <MobileMenuBackdrop />}
      <Box
        css={{
          m: 0,
          display: "flex",
          h: "100dvh",
          maxH: "100dvh",
          w: { base: "full", md: "96" },
          overflow: "hidden",
          transition: "opacity 200ms ease-in-out, transform 200ms ease-in-out",
          transform: {
            base: "translateX(0)",
            md: isOpen ? "translateX(0)" : "translateX(0.5rem)",
          },
          opacity: isOpen ? 1 : 0,
        }}
      >
        <Box
          css={{
            pointerEvents: "auto",
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "stretch",
            bg: "pageBg",
            color: "pageFg",
            borderLeft: { md: "1px solid" },
            borderLeftColor: "pageFg",
            position: "relative",
            overflow: "hidden",
            maxW: "100%",
            maxH: "100%",
          }}
        >
          <Box
            css={{
              display: "flex",
              flexDirection: "column",
              px: { base: "4", md: "6" },
              pt: "20",
              pb: { base: "4", md: "6" },
              fontSize: "sm",
              lineHeight: "snug",
              overflowY: "auto",
              overflowX: "hidden",
              maxW: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              gap: "6",
            }}
          >
            <MobileMenuNavRibbon nav={nav} onItemClick={handleMenuItemClick} />

            <MobileMenuWorkSection
              heading="⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S"
              works={personalWork}
              variant="personal"
              onItemClick={handleMenuItemClick}
              emptyState={
                <Box as="span" css={{ fontSize: "xs", opacity: 0.5 }}>
                  ╭─────────────────╮
                  <br />│ ∅ coming soon ∅ │
                  <br />
                  ╰─────────────────╯
                </Box>
              }
            />

            <MobileMenuWorkSection
              heading="⇝ᵣₑcꫀₙₜ ℘ɑׁׅ֮ᧁׁꫀׁׅܻ꯱ׁׅ֒"
              works={clientWork}
              variant="client"
              onItemClick={handleMenuItemClick}
              emptyState={
                <Box as="span" css={{ fontSize: "xs", opacity: 0.5 }}>
                  ╭───────────────────╮
                  <br />│ ⊹ taking clients ⊹ │
                  <br />
                  ╰───────────────────╯
                </Box>
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(menu, document.body);
};

MobileMenuContent.displayName = "MobileMenuContent";
