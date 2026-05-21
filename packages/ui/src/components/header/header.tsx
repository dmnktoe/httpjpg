"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Box } from "../box/box";
import { Container } from "../container/container";
import { Link } from "../link/link";
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
  imageUrl?: string;
  isDraft?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  date?: string;
}

export interface HeaderProps {
  nav: NavItem[];
  personalWork?: WorkItem[];
  clientWork?: WorkItem[];
  children?: ReactNode;
}

export const Header = ({ nav, personalWork = [], clientWork = [], children }: HeaderProps) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuIsOpen(false);
  }, [pathname]);

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
        color: "pageFg",
        zIndex: { base: "mobileMenuButton", md: "header" },
        pointerEvents: "none",
        py: 4,
        fontSize: "sm",
        userSelect: "none",
      }}
    >
      <Container size="xl" px={{ base: 4, md: 6, lg: 8 }} center={false}>
        <Box
          css={{
            display: "flex",
            w: "full",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12",
          }}
        >
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
            <Link
              href="/"
              css={{
                textDecoration: "underline",
                color: "inherit",
                _hover: {
                  opacity: 0.7,
                },
              }}
            >
              www.httpjpg.com
            </Link>
            <br />
            <Box as="span" css={{ fontSize: "2xs", opacity: 0.7 }}>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ꠹ρᧁ! 🎀
            </Box>
          </Box>

          <Navigation nav={nav} personalWork={personalWork} clientWork={clientWork} />
          <MobileMenuButton isOpen={mobileMenuIsOpen} setIsOpen={setMobileMenuIsOpen} />
        </Box>
      </Container>

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
