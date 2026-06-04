"use client";

import { useEffect, useRef, useState } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trap keyboard focus inside the panel while open; close on Escape. `mounted`
  // is a dependency because the panel only exists once the portal has mounted.
  useEffect(() => {
    if (!isOpen || !mounted) {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      );

    (getFocusable()[0] ?? panel).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, mounted, setIsOpen]);

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
          ref={panelRef}
          // role over a native <dialog>, which the UA `dialog:not([open])` rule
          // would hide; the ancestor owns visibility here.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          tabIndex={-1}
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
            _focusVisible: { outline: "none" },
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
