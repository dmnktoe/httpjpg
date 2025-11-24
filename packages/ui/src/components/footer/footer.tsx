"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { Link } from "../link/link";

export interface FooterProps {
  /**
   * Footer content
   */
  children?: ReactNode;
  /**
   * Background image URL
   */
  backgroundImage?: string;
  /**
   * Show default links (Legal, Privacy)
   * @default true
   */
  showDefaultLinks?: boolean;
  /**
   * Copyright text to display
   */
  copyrightText?: string;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Footer component - Site footer with background texture
 *
 * Displays footer content with optional background image, centered layout,
 * and default links. Perfect for brutalist design with ASCII art.
 *
 * @example
 * ```tsx
 * <Footer backgroundImage="/images/footer/footer_bg.png">
 *   Custom footer content
 * </Footer>
 * ```
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      children,
      backgroundImage,
      showDefaultLinks = true,
      copyrightText,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        as="footer"
        ref={ref}
        style={{
          ...(backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
          paddingTop: "16rem",
          paddingBottom: "16rem",
        }}
        css={{
          borderTop: "1px solid black",
          textAlign: "center",
          w: "100%",
          ...cssProp,
        }}
        {...props}
      >
        <Box css={{ w: "100%", mx: "auto", px: "4" }}>
          {children ? (
            children
          ) : (
            <Box
              css={{
                filter: "drop-shadow(0 35px 35px rgba(0,0,0,0.25))",
              }}
            >
              {showDefaultLinks && (
                <>
                  <Link href="/legal">Legal</Link>
                  <br />
                  <Link href="/privacy">Privacy</Link>
                  <br />
                </>
              )}
              *ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚
              <br />
              {copyrightText || "༺yl33ly httpjpg icon.icon.iconn te3shay༻"}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
