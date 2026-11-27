import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Link } from "../link/link";
import { FeedAppBarStatus } from "./feed-app-bar-status";

export interface FeedAppBarProps {
  /** The title in the middle of the bar, set in the script face. */
  children: ReactNode;
  /** Draws a back button on the left. */
  back?: { href: string; label: string };
  css?: SystemStyleObject;
}

/** The status and navigation bar of a 2010 iPhone app, heading the feed. */
export function FeedAppBar({ children, back, css: cssProp }: FeedAppBarProps) {
  return (
    <Box
      data-feed-app-bar=""
      css={{
        borderRadius: { md: "0.5rem 0.5rem 0 0" },
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        ...cssProp,
      }}
    >
      <FeedAppBarStatus />
      <Box
        css={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "2",
          h: { base: "3.5rem", md: "4.25rem" },
          px: "2",
          color: "white",
          bg: "linear-gradient(to bottom, {colors.primary.500} 0%, {colors.primary.600} 50%, {colors.primary.700} 50%, {colors.primary.800} 100%)",
          borderBottom: "1px solid {colors.primary.950}",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.45)",
          _before: {
            position: "absolute",
            inset: 0,
            content: '""',
            bg: "repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.07) 0 1px, transparent 1px 4px)",
            pointerEvents: "none",
          },
        }}
      >
        <Box css={{ position: "relative", justifySelf: "start" }}>
          {back && (
            <Link
              href={back.href}
              css={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1",
                h: "1.875rem",
                px: "2.5",
                color: "white",
                fontFamily: "sans",
                fontSize: "sm",
                fontWeight: "bold",
                textDecoration: "none",
                bg: "linear-gradient(to bottom, {colors.primary.600} 0%, {colors.primary.700} 50%, {colors.primary.800} 50%, {colors.primary.900} 100%)",
                border: "1px solid {colors.primary.950}",
                borderRadius: "0.3125rem",
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 1px 0 rgba(255, 255, 255, 0.25)",
                textShadow: "0 -1px 0 rgba(0, 0, 0, 0.45)",
                _hover: { filter: "brightness(1.1)" },
                _active: { filter: "brightness(0.85)" },
              }}
            >
              <span aria-hidden="true">‹</span>
              {back.label}
            </Link>
          )}
        </Box>
        <Box
          css={{
            position: "relative",
            fontFamily: "accent",
            fontSize: { base: "2rem", md: "2.625rem" },
            fontWeight: "normal",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textShadow: "0 -1px 0 rgba(0, 0, 0, 0.5), 0 0 1rem rgba(255, 255, 255, 0.25)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
