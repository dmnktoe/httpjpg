"use client";

import React, { forwardRef, type ReactNode } from "react";
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
   * Widget area content (e.g., Discord status, badges, etc.)
   */
  widgets?: ReactNode;
  /**
   * Show development console link
   */
  showConsoleLink?: boolean;
  /**
   * Show version info
   */
  showVersion?: boolean;
  /**
   * Version string to display
   */
  version?: string;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Footer component - Site footer with background texture
 *
 * A generic, reusable footer component with support for:
 * - Custom background images
 * - Navigation links
 * - Cookie settings callback
 * - Widget area for custom content (badges, status indicators, etc.)
 * - Flexible content via children prop
 *
 * Perfect for brutalist design with ASCII art and centered layout.
 *
 * @example
 * ```tsx
 * <Footer
 *   backgroundImage="/images/footer_bg.png"
 *   footerLinks={[
 *     { name: "Legal", href: "/legal" },
 *     { name: "Privacy", href: "/privacy" },
 *   ]}
 *   widgets={<DiscordStatus />}
 *   copyrightText="© 2025 My Site"
 * />
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
      widgets,
      showConsoleLink = false,
      showVersion = false,
      version,
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
                    <React.Fragment key={link.href}>
                      {index > 0 && <Box as="span">·</Box>}
                      <Link href={link.href} isExternal={link.isExternal}>
                        {link.name}
                      </Link>
                    </React.Fragment>
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
                {showConsoleLink && (
                  <>
                    <Box as="span" css={{ opacity: 0.3 }}>
                      ·
                    </Box>
                    <Link
                      href="/console"
                      css={{
                        color: "secondary.600",
                        fontWeight: "600",
                        textShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
                        transition: "all 0.3s ease-in-out",
                        _hover: {
                          color: "secondary.500",
                          textShadow: "0 0 20px rgba(168, 85, 247, 0.8)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      🔒 Console
                    </Link>
                  </>
                )}
              </Box>

              {/* Divider */}
              {(widgets || copyrightText || showVersion) && (
                <Box as="span">*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</Box>
              )}

              {/* Widgets Area */}
              {widgets && <Box css={{ w: "full" }}>{widgets}</Box>}

              {/* Copyright */}
              {copyrightText && <Box as="span">{copyrightText}</Box>}

              {/* Version */}
              {showVersion && (
                <Box
                  as="span"
                  css={{
                    fontSize: "xs",
                    opacity: 0.4,
                    fontFamily: "mono",
                    letterSpacing: "0.05em",
                  }}
                >
                  {version || "v-dev"}
                </Box>
              )}
            </VStack>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
