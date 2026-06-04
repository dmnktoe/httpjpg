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

export function MobileMenuContent({
  isOpen,
  setIsOpen,
  nav,
  projectsWork = [],
  websitesWork = [],
}: MobileMenuContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  if (!mounted) {
    return null;
  }

  const menu = (
    <Box
      aria-hidden={!isOpen}
      css={{
        position: "fixed",
        inset: 0,
        zIndex: "mobileMenu",
        display: isOpen ? { base: "flex", lg: "none" } : "none",
        flexDirection: "row",
        justifyContent: { md: "end" },
        w: "full",
        maxW: "full",
        maxH: "100dvh",
      }}
    >
      <MobileMenuBackdrop />
      <Box
        css={{
          display: "flex",
          w: { base: "full", md: "96" },
          h: "100dvh",
          maxH: "100dvh",
          m: 0,
          overflow: "hidden",
        }}
      >
        <Box
          css={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "stretch",
            maxW: "100%",
            maxH: "100%",
            color: "pageFg",
            bg: "pageBg",
            borderLeft: { md: "1px solid" },
            borderLeftColor: "pageFg",
            pointerEvents: "auto",
            overflow: "hidden",
          }}
        >
          <Box
            css={{
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
              gap: "6",
              maxW: "100%",
              minHeight: 0,
              px: { base: "4", md: "6" },
              pt: "20",
              pb: { base: "4", md: "6" },
              fontSize: "sm",
              lineHeight: "snug",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <MobileMenuNavRibbon nav={nav} onItemClick={handleMenuItemClick} />

            <MobileMenuWorkSection
              heading="⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S"
              works={projectsWork}
              variant="projects"
              onItemClick={handleMenuItemClick}
              emptyState={
                <Box as="span" css={{ opacity: 0.5, fontSize: "xs" }}>
                  ╭─────────────────╮
                  <br />│ ∅ coming soon ∅ │
                  <br />
                  ╰─────────────────╯
                </Box>
              }
            />

            <MobileMenuWorkSection
              heading="⇝ᵣₑcꫀₙₜ ℘ɑׁׅ֮ᧁׁꫀׁׅܻ꯱ׁׅ֒"
              works={websitesWork}
              variant="websites"
              onItemClick={handleMenuItemClick}
              emptyState={
                <Box as="span" css={{ opacity: 0.5, fontSize: "xs" }}>
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

  return createPortal(menu, document.body);
}

MobileMenuContent.displayName = "MobileMenuContent";
