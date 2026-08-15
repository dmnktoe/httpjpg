"use client";

import React, { forwardRef, useCallback, type ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { ASCII_DIVIDER_STARS } from "../ascii-art/banners";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { VStack } from "../stack/stack";

/** Dispatched on `window` to ask the cookie banner to open its settings view. */
export const OPEN_COOKIE_SETTINGS_EVENT = "openCookieSettings";

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
  showCookieSettings?: boolean;
  cookiePolicyHref?: string;
  widgets?: ReactNode;
  showVersion?: boolean;
  version?: string;
  versionHref?: string;
  /** Dofollow credit for visual testing (e.g. Argos OSS sponsorship). */
  visualTestingHref?: string;
  visualTestingLabel?: string;
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
      showCookieSettings = false,
      cookiePolicyHref,
      widgets,
      showVersion = false,
      version,
      versionHref,
      visualTestingHref,
      visualTestingLabel = "Argos",
      lastUpdated,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const handleCookieSettingsClick = useCallback(() => {
      if (onCookieSettingsClick) {
        onCookieSettingsClick();
      } else {
        window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
      }
    }, [onCookieSettingsClick]);

    const hasCookieSettings = showCookieSettings || Boolean(onCookieSettingsClick);

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
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  rowGap: "0",
                  columnGap: "2",
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
                {hasCookieSettings && (
                  <>
                    {footerLinks && footerLinks.length > 0 && (
                      <Box as="span" css={{ opacity: 0.3 }}>
                        ·
                      </Box>
                    )}
                    <Box
                      as="button"
                      onClick={handleCookieSettingsClick}
                      css={{
                        p: 0,
                        color: "inherit",
                        fontSize: "inherit",
                        textDecoration: "underline",
                        textDecorationThickness: "1px",
                        bg: "transparent",
                        border: "none",
                        transition: "text-decoration-style 150ms ease-in-out",
                        cursor: "pointer",
                        textUnderlineOffset: "2px",
                        _hover: { textDecorationStyle: "wavy" },
                      }}
                    >
                      Cookie Settings
                    </Box>
                    {cookiePolicyHref && (
                      <>
                        <Box as="span" css={{ opacity: 0.3 }}>
                          ·
                        </Box>
                        <Link href={cookiePolicyHref}>Cookie Policy</Link>
                      </>
                    )}
                  </>
                )}
              </Box>

              {copyrightText && <Box as="span">{copyrightText}</Box>}

              {(widgets || copyrightText || showVersion || visualTestingHref) && (
                <Box as="span" css={{ my: "6" }}>
                  {ASCII_DIVIDER_STARS}
                </Box>
              )}

              {widgets && <Box css={{ w: "full" }}>{widgets}</Box>}

              {(showVersion || visualTestingHref) && (
                <Box
                  as="span"
                  css={{
                    opacity: 0.4,
                    fontFamily: "mono",
                    fontSize: "xs",
                    letterSpacing: "0.05em",
                  }}
                >
                  {showVersion && (
                    <>
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
                    </>
                  )}
                  {visualTestingHref && (
                    <>
                      {showVersion && " // "}
                      <Box
                        as="a"
                        href={visualTestingHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{
                          color: "inherit",
                          textDecoration: "none",
                          _hover: { textDecoration: "underline" },
                        }}
                      >
                        {visualTestingLabel}
                      </Box>
                    </>
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
