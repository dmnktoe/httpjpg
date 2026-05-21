"use client";

import { Box } from "../box/box";
import { Link } from "../link/link";
import type { NavItem } from "./header";

interface MobileMenuNavRibbonProps {
  nav: NavItem[];
  onItemClick: () => void;
}

export const MobileMenuNavRibbon = ({ nav, onItemClick }: MobileMenuNavRibbonProps) => (
  <Box>
    {nav.map((item) => (
      <span key={item.name}>
        🎀 ⋆ﾟ･
        <Link
          href={item.href}
          isExternal={item.isExternal}
          showExternalIcon={false}
          onClick={onItemClick}
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

MobileMenuNavRibbon.displayName = "MobileMenuNavRibbon";
