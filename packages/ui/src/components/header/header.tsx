"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Box } from "../box/box";
import { Container } from "../container/container";
import { MobileMenuButton } from "./mobile-menu-button";
import { MobileMenuContent } from "./mobile-menu-content";
import { Navigation } from "./navigation";

export interface NavItem {
  name: string;
  href: string;
  isExternal?: boolean;
}

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
}

export interface HeaderProps {
  /**
   * Navigation items for the main menu
   */
  nav: NavItem[];
  /**
   * Recent personal work items
   */
  personalWork?: WorkItem[];
  /**
   * Recent client work items
   */
  clientWork?: WorkItem[];
  /**
   * Dark mode variant (inverts colors for dark backgrounds)
   */
  isDark?: boolean;
  /**
   * Additional content or custom elements
   */
  children?: ReactNode;
}

/**
 * Header component with brutalist ASCII art style
 *
 * Features a unique navigation layout with ASCII decorations,
 * responsive mobile menu, and sections for recent work.
 *
 * @example
 * ```tsx
 * <Header
 *   nav={[
 *     { name: "Home", href: "/" },
 *     { name: "About", href: "/about" },
 *   ]}
 *   personalWork={[
 *     { id: "1", slug: "project-1", title: "Project 1" }
 *   ]}
 * />
 * ```
 */
export const Header = ({
  nav,
  personalWork = [],
  clientWork = [],
  isDark = false,
  children,
}: HeaderProps) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(280);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        setHeaderHeight(height);
      }
    };

    // Initial measure with delay
    const timeoutId = setTimeout(updateHeight, 100);

    // Measure on resize
    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [personalWork, clientWork, nav]);

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          background: "transparent",
          color: isDark ? "white" : "black",
          zIndex: 50,
          pointerEvents: "auto",
        }}
      >
        <Container size="xl">
          <Box
            css={{
              display: "flex",
              w: "full",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12",
              py: "4",
            }}
          >
            <Navigation
              nav={nav}
              personalWork={personalWork}
              clientWork={clientWork}
            />
            <MobileMenuButton
              isOpen={mobileMenuIsOpen}
              setIsOpen={setMobileMenuIsOpen}
            />
          </Box>
        </Container>

        {/* Mobile Menu Overlay */}
        <MobileMenuContent
          isOpen={mobileMenuIsOpen}
          setIsOpen={setMobileMenuIsOpen}
          nav={nav}
          personalWork={personalWork}
          clientWork={clientWork}
          isDark={isDark}
        />

        {children}
      </header>

      {/* Spacer to prevent content overlap */}
      <div
        style={{
          height: `${headerHeight}px`,
        }}
        aria-hidden="true"
      />
    </>
  );
};
Header.displayName = "Header";
