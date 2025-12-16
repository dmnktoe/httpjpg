"use client";

import { Box, Footer } from "@httpjpg/ui";
import { DiscordStatus } from "@/components/widgets/discord-status";
import { FlagCounter } from "@/components/widgets/flag-counter";

interface FooterWrapperProps {
  /**
   * Background image URL from CMS
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
   * Copyright text from CMS
   */
  copyrightText?: string;
}

/**
 * Footer Wrapper for httpjpg web app
 *
 * This wrapper combines the generic Footer component from @httpjpg/ui
 * with app-specific widgets and content like Discord status and counters.
 */
export function FooterWrapper({
  backgroundImage,
  footerLinks,
  copyrightText,
}: FooterWrapperProps) {
  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  const isDevelopment = process.env.NODE_ENV === "development";
  const version = process.env.NEXT_PUBLIC_APP_VERSION
    ? `v${process.env.NEXT_PUBLIC_APP_VERSION.slice(0, 7)}`
    : undefined;
  const showVersion = true;

  return (
    <Footer
      backgroundImage={backgroundImage}
      footerLinks={footerLinks}
      copyrightText={undefined}
      onCookieSettingsClick={handleCookieSettingsClick}
      showConsoleLink={isDevelopment}
      showVersion={false}
      version={undefined}
      widgets={
        <Box
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0",
            w: "full",
          }}
        >
          {/* Discord Status Widget */}
          <DiscordStatus />

          {/* Copyright */}
          <Box as="span">{copyrightText}</Box>

          {/* Version */}
          {showVersion && version && (
            <Box
              as="span"
              css={{
                fontSize: "xs",
                opacity: 0.4,
                fontFamily: "mono",
                letterSpacing: "0.05em",
              }}
            >
              {version}
            </Box>
          )}

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
            <FlagCounter />
          </Box>
        </Box>
      }
    />
  );
}
