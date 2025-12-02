"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { VStack } from "../stack/stack";

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
   * Callback when cookie settings button is clicked
   */
  onCookieSettingsClick?: () => void;
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
      onCookieSettingsClick,
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
        }}
        css={{
          py: 64,
          textAlign: "center",
          w: "full",
          ...cssProp,
        }}
        {...props}
      >
        <Box css={{ w: "100%", mx: "auto", px: "4", fontSize: "sm" }}>
          {children ? (
            children
          ) : (
            <VStack gap="0" align="center">
              {showDefaultLinks && (
                <>
                  <Link href="/legal">Legal</Link>
                  <Link href="/privacy">Privacy</Link>
                </>
              )}
              {onCookieSettingsClick && (
                <Box
                  as="button"
                  onClick={onCookieSettingsClick}
                  css={{
                    bg: "transparent",
                    border: "none",
                    cursor: "pointer",
                    p: 0,
                    textDecoration: "underline",
                    textDecorationThickness: "1px",
                    textUnderlineOffset: "2px",
                    color: "inherit",
                    fontSize: "inherit",
                    transition: "text-decoration-style 150ms ease-in-out",
                    _hover: {
                      textDecorationStyle: "wavy",
                    },
                  }}
                >
                  Cookie Settings
                </Box>
              )}
              <Box as="span">*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</Box>
              <Box as="span">
                {copyrightText || "༺yl33ly httpjpg icon.icon.iconn te3shay༻"}
              </Box>
            </VStack>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
