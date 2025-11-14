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
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        as="footer"
        ref={ref}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        css={{
          borderTop: "1px solid black",
          py: "64",
          textAlign: "center",
          ...cssProp,
        }}
        {...props}
      >
        <Box css={{ maxW: "1200px", mx: "auto", px: "4", py: "4" }}>
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
              ༺yl33ly httpjpg icon.icon.iconn te3shay༻
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
