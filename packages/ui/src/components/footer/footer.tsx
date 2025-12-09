"use client";

import React, { forwardRef, type ReactNode, useEffect, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { VStack } from "../stack/stack";

/**
 * Discord Status Component
 * Shows live Discord online status via Lanyard API
 */
const DiscordStatus = () => {
  const [status, setStatus] = useState<"online" | "idle" | "dnd" | "offline">(
    "offline",
  );
  const [activity, setActivity] = useState<string | null>(null);
  const [playtime, setPlaytime] = useState<string | null>(null);
  const [activityIcon, setActivityIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/discord");
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status || "offline");
          setActivity(data.activity || null);
          setPlaytime(data.activityDetails?.playtime || null);
          setActivityIcon(data.activityDetails?.icon || null);
        }
      } catch (error) {
        console.error("Failed to fetch Discord status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    online: "#22C55E",
    idle: "#F59E0B",
    dnd: "#EF4444",
    offline: "#737373",
  };

  const statusEmoji = {
    online: "🟢",
    idle: "🟡",
    dnd: "🔴",
    offline: "⚫",
  };

  return (
    <Box
      css={{
        fontSize: "xs",
        fontFamily: "mono",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        opacity: 80,
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        discord:
      </Box>
      <Box as="span">{statusEmoji[status]}</Box>
      <Box as="span" style={{ color: statusColors[status] }}>
        {status}
      </Box>
      {activity && (
        <>
          <Box as="span" css={{ opacity: 50 }}>
            ·
          </Box>
          {activityIcon && (
            <Box
              as="span"
              css={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                verticalAlign: "middle",
                marginRight: "4px",
                borderRadius: "2px",
                overflow: "hidden",
              }}
              data-preview-image={activityIcon}
              data-preview-ratio="1:1"
            >
              <img
                src={activityIcon}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          )}
          <Box
            as="span"
            css={{
              opacity: 70,
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            data-preview-image={activityIcon || undefined}
          >
            {activity}
          </Box>
          {playtime && (
            <>
              <Box as="span" css={{ opacity: 50 }}>
                ·
              </Box>
              <Box as="span" css={{ opacity: 60 }}>
                {playtime}
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

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
                {process.env.NODE_ENV === "development" && (
                  <>
                    <Box as="span" css={{ opacity: 0.3 }}>
                      ·
                    </Box>
                    <Link
                      href="/console"
                      css={{
                        color: "purple.600",
                        fontWeight: "600",
                        textShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
                        transition: "all 0.3s ease-in-out",
                        _hover: {
                          color: "purple.500",
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
              <Box as="span">*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</Box>

              {/* Discord Status */}
              <DiscordStatus />

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

              {/* Retro Web Counters */}
              <Box
                css={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4",
                  mt: "6",
                }}
              >
                {/* Flag Counter */}
                <Box as="span">
                  <a href="https://info.flagcounter.com/ncez">
                    <img
                      src="https://s01.flagcounter.com/count2/ncez/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_9/viewers_0/labels_0/pageviews_1/flags_0/percent_0/"
                      alt="Flag Counter"
                      style={{ border: 0 }}
                    />
                  </a>
                </Box>
              </Box>
            </VStack>
          )}
        </Box>
      </Box>
    );
  },
);

Footer.displayName = "Footer";
