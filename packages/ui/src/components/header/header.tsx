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
  /**
   * Main preview image URL for cursor hover
   */
  imageUrl?: string;
  /**
   * Is this a draft (unpublished) story?
   */
  isDraft?: boolean;
  /**
   * Is this an external link?
   */
  isExternal?: boolean;
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
  /**
   * Center the container horizontally (default: true)
   */
  center?: boolean;
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
  center = true,
}: HeaderProps) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <Box
      as="header"
      css={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        w: "full",
        bg: "transparent",
        color: "black",
        zIndex: "header",
        pointerEvents: "auto",
        py: 4,
        fontSize: "sm",
        userSelect: "none",
      }}
    >
      <Container size="2xl" px={{ base: 4, md: 6, lg: 8 }} center={center}>
        <Box
          css={{
            display: "flex",
            w: "full",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12",
          }}
        >
          {/* Mobile ASCII Logo */}
          <Box
            css={{
              display: { base: "block", md: "none" },
              lineHeight: "snug",
              fontSize: "xs",
              maxW: "64",
            }}
          >
            <Box as="span" css={{ fontWeight: "bold" }}>
              ⇝HE𝓁𝓁O
            </Box>
            <br />
            <Box as="span">www.httpjpg.com</Box>
            <br />
            <Box as="span" css={{ fontSize: "2xs", opacity: 0.7 }}>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ꠹ρᧁ! 🎀
            </Box>
          </Box>

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
