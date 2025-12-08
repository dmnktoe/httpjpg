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
   * Footer links from CMS
   */
  footerLinks?: Array<{
    name: string;
    href: string;
    isExternal?: boolean;
  }>;
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
      footerLinks,
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
              {/* Links Row */}
              <Box
                css={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {footerLinks &&
                  footerLinks.length > 0 &&
                  footerLinks.map((link, index) => (
                    <>
                      {index > 0 && (
                        <Box key={`sep-${index}`} as="span">
                          ·
                        </Box>
                      )}
                      <Link
                        key={link.href}
                        href={link.href}
                        isExternal={link.isExternal}
                      >
                        {link.name}
                      </Link>
                    </>
                  ))}
                {onCookieSettingsClick && (
                  <>
                    {footerLinks && footerLinks.length > 0 && (
                      <Box as="span" css={{ opacity: 0.3 }}>
                        ·
                      </Box>
                    )}
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
                  </>
                )}
              </Box>

              {/* Divider */}
              <Box as="span">*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</Box>

              {/* Copyright */}
              <Box as="span">
                {copyrightText || "༺yl33ly httpjpg icon.icon.iconn te3shay༻"}
              </Box>

              {/* Version */}
              <Box
                as="span"
                css={{
                  fontSize: "xs",
                  opacity: 0.4,
                  fontFamily: "mono",
                  letterSpacing: "0.05em",
                }}
              >
                {process.env.NEXT_PUBLIC_APP_VERSION
                  ? `v${process.env.NEXT_PUBLIC_APP_VERSION.slice(0, 7)}`
                  : "v-dev"}
              </Box>
            </VStack>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
