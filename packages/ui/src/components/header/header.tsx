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
  projectsWork?: WorkItem[];
  websitesWork?: WorkItem[];
  children?: ReactNode;
}

export function Header({ nav, projectsWork = [], websitesWork = [], children }: HeaderProps) {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileMenuIsOpen(false);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <Box
      as="header"
      css={{
        position: "sticky",
        top: 0,
        right: 0,
        left: 0,
        zIndex: { base: "mobileMenuButton", lg: "header" },
        w: "full",
        py: 4,
        color: "pageFg",
        fontSize: "sm",
        bg: "transparent",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Container size="xl" px={{ base: 4, md: 6, lg: 8 }} center={false}>
        <Box
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12",
            w: "full",
          }}
        >
          <Box
            css={{
              display: { base: "block", lg: "none" },
              maxW: "64",
              fontSize: "xs",
              lineHeight: "snug",
            }}
          >
            <Box as="span" css={{ fontWeight: "bold" }}>
              ⇝HE𝓁𝓁O
            </Box>
            <br />
            <Link
              href="/"
              css={{ color: "inherit", textDecoration: "underline", _hover: { opacity: 0.7 } }}
            >
              www.httpjpg.com
            </Link>
            <br />
            <Box as="span" css={{ opacity: 0.7, fontSize: "2xs" }}>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ꠹ρᧁ! 🎀
            </Box>
          </Box>

          <Navigation nav={nav} projectsWork={projectsWork} websitesWork={websitesWork} />
          <MobileMenuButton isOpen={mobileMenuIsOpen} setIsOpen={setMobileMenuIsOpen} />
        </Box>
      </Container>

      <MobileMenuContent
        isOpen={mobileMenuIsOpen}
        setIsOpen={setMobileMenuIsOpen}
        nav={nav}
        projectsWork={projectsWork}
        websitesWork={websitesWork}
      />

      {children}
    </Box>
  );
}
Header.displayName = "Header";
