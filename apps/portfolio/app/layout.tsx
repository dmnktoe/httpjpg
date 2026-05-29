import { env } from "@httpjpg/env";

import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import "@/lib/storyblok";
import {
  ASCII_DIVIDER_WAVE,
  AsciiArt,
  Box,
  Footer,
  Header,
  ImagePreview,
  LazyMotionProvider,
} from "@httpjpg/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { ConsentProvider } from "@/components/providers/consent-provider";
import { StoryblokProvider } from "@/components/providers/storyblok-provider";
import { ConsoleBanner } from "@/components/ui/console-banner";
import { CustomCursorWrapper } from "@/components/ui/custom-cursor-wrapper";
import { NostalgiaSlideshow } from "@/components/ui/nostalgia-slideshow";
import { PreviewNotification } from "@/components/ui/preview-notification";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { DiscordStatus } from "@/components/widgets/discord-status";
import { FlagCounter } from "@/components/widgets/flag-counter";
import { NowPlayingWidget } from "@/components/widgets/now-playing-widget";
import { PSNCard } from "@/components/widgets/psn-card";
import { WebVitalsReporter } from "@/components/widgets/web-vitals-reporter";
import { config } from "@/lib/config";
import { getPageTheme } from "@/lib/page-theme";
import { getFooterConfig, getNavigation, getSeoDefaults } from "@/lib/queries/config";
import { getLastUpdated } from "@/lib/queries/last-updated";
import { getFeatureFlags, getWidgetConfig } from "@/lib/queries/widgets";
import { getRecentWork } from "@/lib/queries/work";

import "./globals.css";

const FALLBACK_DESCRIPTION =
  "Personal portfolio showcasing creative work, design, and development projects";

function formatVersion(raw: string): string {
  if (/^v?\d+\.\d+\.\d+/.test(raw)) {
    return raw.startsWith("v") ? raw : `v${raw}`;
  }
  return `v${raw.slice(0, 7)}`;
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoDefaults();
  return {
    title: {
      absolute: seo.title || config.appName,
      default: seo.title || config.appName,
      template: `%s ${config.appName}`,
    },
    description: seo.description || FALLBACK_DESCRIPTION,
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: config.appName,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const navigation = await getNavigation();
  const footerConfig = await getFooterConfig();
  const widgetConfig = await getWidgetConfig();
  const flags = await getFeatureFlags();
  const { personalWork, clientWork } = await getRecentWork();
  const lastUpdated = flags.lastUpdatedBadgeEnabled ? await getLastUpdated() : undefined;
  const theme = await getPageTheme();

  const rawVersion = env.NEXT_PUBLIC_APP_VERSION;
  const version = rawVersion ? formatVersion(rawVersion) : undefined;

  return (
    <html lang="de" data-theme={theme}>
      <body style={{ margin: 0, padding: 0 }}>
        <ConsentProvider>
          <ConsoleBanner />
          <WebVitalsReporter />
          <ScrollToTop />
          <LazyMotionProvider>
            <StoryblokProvider>
              <CustomCursorWrapper
                cursorEnabled={widgetConfig.customCursorEnabled}
                trailEnabled={widgetConfig.mouseTrailEnabled}
              />
              <ImagePreview />
              {widgetConfig.nostalgiaSlideshowEnabled && <NostalgiaSlideshow />}
              {widgetConfig.spotifyEnabled && <NowPlayingWidget />}
              {widgetConfig.psnEnabled && <PSNCard username={widgetConfig.psnUsername} />}
              <PreviewNotification />
              <Header nav={navigation} personalWork={personalWork} clientWork={clientWork} />
              <Box
                as="main"
                css={{
                  bg: "pageBg",
                  color: "pageFg",
                  w: "full",
                  minH: "100dvh",
                }}
              >
                {children}
              </Box>
              <Footer
                backgroundImage={footerConfig.backgroundImage}
                footerLinks={footerConfig.footerLinks}
                copyrightText={footerConfig.copyrightText}
                showCookieSettings
                cookiePolicyHref="/cookie-policy"
                showVersion={Boolean(lastUpdated || version)}
                version={version}
                versionHref={
                  version ? `https://github.com/dmnktoe/httpjpg/releases/tag/${version}` : undefined
                }
                lastUpdated={
                  lastUpdated ? `last updated ${formatLastUpdated(lastUpdated)}` : undefined
                }
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
            </StoryblokProvider>
          </LazyMotionProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
