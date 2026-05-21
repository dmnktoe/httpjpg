"use client";

import { ASCII_DIVIDER_WAVE, ASCII_SPARKLES, AsciiArt, Box, Footer } from "@httpjpg/ui";

import { DiscordStatus } from "@/components/widgets/discord-status";
import { FlagCounter } from "@/components/widgets/flag-counter";

interface FooterWrapperProps {
  backgroundImage?: string;
  footerLinks?: Array<{
    name: string;
    href: string;
    isExternal?: boolean;
  }>;
  copyrightText?: string;
  lastUpdated?: string;
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function FooterWrapper({
  backgroundImage,
  footerLinks,
  copyrightText,
  lastUpdated,
}: FooterWrapperProps) {
  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const version = rawVersion
    ? /^v?\d+\.\d+\.\d+/.test(rawVersion)
      ? rawVersion.startsWith("v")
        ? rawVersion
        : `v${rawVersion}`
      : `v${rawVersion.slice(0, 7)}`
    : undefined;

  return (
    <Footer
      backgroundImage={backgroundImage}
      footerLinks={footerLinks}
      copyrightText={copyrightText}
      onCookieSettingsClick={handleCookieSettingsClick}
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
          <DiscordStatus />
          {(lastUpdated || version) && (
            <Box
              as="span"
              css={{
                fontSize: "xs",
                opacity: 0.4,
                fontFamily: "mono",
                letterSpacing: "0.05em",
              }}
            >
              {lastUpdated && `↻ last updated ${formatLastUpdated(lastUpdated)}`}
              {lastUpdated && version && ` // ${ASCII_SPARKLES} // `}
              {version}
            </Box>
          )}
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
            <AsciiArt
              label="signoff"
              css={{ fontSize: "xs", opacity: 0.3, letterSpacing: "0.2em" }}
            >
              {ASCII_DIVIDER_WAVE}
            </AsciiArt>
          </Box>
        </Box>
      }
    />
  );
}
