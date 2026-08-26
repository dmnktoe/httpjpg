"use client";

import { usePathname } from "next/navigation";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { useBodyScrollLock } from "../../lib/use-body-scroll-lock";
import { Box } from "../box/box";
import { Container } from "../container/container";
import { Link } from "../link/link";
import { MiniPlayerSlot } from "../music-player/mini-player-slot";
import { SearchTrigger } from "../search-trigger/search-trigger";
import { HeaderScrollVeil } from "./header-scroll-veil";
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
  /** Renders the search trigger next to the nav. @default false */
  showSearch?: boolean;
  /** Fades a theme-aware scrim in behind the header on scroll. @default true */
  showScrollVeil?: boolean;
  children?: ReactNode;
}

export function Header({
  nav,
  projectsWork = [],
  websitesWork = [],
  showSearch = false,
  showScrollVeil = true,
  children,
}: HeaderProps) {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const headerHeight = useElementHeight(headerRef);
  const pathname = usePathname();
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMobileMenuIsOpen(false);
  }

  useBodyScrollLock(mobileMenuIsOpen);

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
    <>
      {showScrollVeil && <HeaderScrollVeil height={headerHeight} />}
      {mobileMenuIsOpen && headerHeight > 0 ? (
        <Box aria-hidden="true" style={{ height: headerHeight }} />
      ) : null}
      <Box
        as="header"
        ref={headerRef}
        // Pin while the menu is open so the close control stays on screen.
        // Spacer above keeps header height in flow for scroll-lock restore.
        css={{
          position: mobileMenuIsOpen ? "fixed" : "sticky",
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
                {showSearch && (
                  <>
                    {" • "}
                    <SearchTrigger />
                  </>
                )}
                <MiniPlayerSlot />
              </Box>
            </Box>

            <Navigation
              nav={nav}
              projectsWork={projectsWork}
              websitesWork={websitesWork}
              showSearch={showSearch}
            />
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
    </>
  );
}
Header.displayName = "Header";

function useElementHeight(ref: RefObject<HTMLElement | null>): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const measure = () => setHeight(node.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
