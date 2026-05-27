"use client";

import React, { forwardRef, type ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { ASCII_DIVIDER_STARS } from "../ascii-art/banners";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { VStack } from "../stack/stack";

export interface FooterProps {
  children?: ReactNode;
  backgroundImage?: string;
  footerLinks?: Array<{
    name: string;
    href: string;
    isExternal?: boolean;
  }>;
  copyrightText?: string;
  onCookieSettingsClick?: () => void;
  widgets?: ReactNode;
  showVersion?: boolean;
  version?: string;
  versionHref?: string;
  lastUpdated?: string;
  css?: SystemStyleObject;
}

export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      children,
      backgroundImage,
      footerLinks,
      copyrightText,
      onCookieSettingsClick,
      widgets,
      showVersion = false,
      version,
      versionHref,
      lastUpdated,
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
              <Box
                css={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "2",
                  rowGap: "0",
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
              </Box>

              {copyrightText && <Box as="span">{copyrightText}</Box>}

              {(widgets || copyrightText || showVersion) && (
                <Box as="span" css={{ my: "6" }}>
                  {ASCII_DIVIDER_STARS}
                </Box>
              )}

              {widgets && <Box css={{ w: "full" }}>{widgets}</Box>}

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
                  {lastUpdated && `↻ ${lastUpdated}`}
                  {lastUpdated && version && " // ✦ // "}
                  {version ? (
                    versionHref ? (
                      <Box
                        as="a"
                        href={versionHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{
                          color: "inherit",
                          textDecoration: "none",
                          _hover: { textDecoration: "underline" },
                        }}
                      >
                        {version}
                      </Box>
                    ) : (
                      version
                    )
                  ) : (
                    "v-dev"
                  )}
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
