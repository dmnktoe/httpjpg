"use client";

import { Box } from "../box/box";
import { Link } from "../link/link";
import type { NavClickPayload, NavItem } from "./header";

interface MobileMenuNavRibbonProps {
  nav: NavItem[];
  onItemClick: () => void;
  onNavClick?: (payload: NavClickPayload) => void;
}

export function MobileMenuNavRibbon({ nav, onItemClick, onNavClick }: MobileMenuNavRibbonProps) {
  return (
    <Box>
      {nav.map((item) => (
        <span key={item.name}>
          🎀 ⋆ﾟ･
          <Link
            href={item.href}
            isExternal={item.isExternal}
            showExternalIcon={false}
            onClick={() => {
              onNavClick?.({
                label: item.name,
                href: item.href,
                source: "mobile",
                kind: "menu",
                ...(item.isExternal ? { external: true } : {}),
              });
              onItemClick();
            }}
            css={{
              fontFamily: "accent",
              textDecoration: "none",
              _hover: { textDecoration: "underline" },
            }}
          >
            {item.name.toUpperCase()}
          </Link>
          &ensp;ꗃ&ensp;
        </span>
      ))}
    </Box>
  );
}
