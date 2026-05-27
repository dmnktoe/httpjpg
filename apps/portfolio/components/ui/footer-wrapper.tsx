"use client";

import { ASCII_DIVIDER_WAVE, AsciiArt, Box, Footer } from "@httpjpg/ui";

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

function formatVersion(raw: string): string {
  if (/^v?\d+\.\d+\.\d+/.test(raw)) {
    return raw.startsWith("v") ? raw : `v${raw}`;
  }
  return `v${raw.slice(0, 7)}`;
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
  const version = rawVersion ? formatVersion(rawVersion) : undefined;

  return (
    <Footer
      backgroundImage={backgroundImage}
      footerLinks={footerLinks}
      copyrightText={copyrightText}
      onCookieSettingsClick={handleCookieSettingsClick}
      showVersion={Boolean(lastUpdated || version)}
      version={version}
      versionHref={
        version ? `https://github.com/dmnktoe/httpjpg/releases/tag/${version}` : undefined
      }
      lastUpdated={lastUpdated ? `last updated ${formatLastUpdated(lastUpdated)}` : undefined}
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
