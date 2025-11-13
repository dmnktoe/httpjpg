"use client";

import type { ReactNode } from "react";
import { useState } from "react";
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
  children,
}: HeaderProps) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <Box as="header" css={{ position: "relative", w: "full" }}>
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
      />

      {children}
    </Box>
  );
};

Header.displayName = "Header";
