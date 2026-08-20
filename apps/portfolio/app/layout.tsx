import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import "@/lib/storyblok";
import { env } from "@httpjpg/env";
import {
  ASCII_DIVIDER_WAVE,
  AsciiArt,
  AudioPlayerProvider,
  Box,
  Footer,
  Header,
  ImagePreview,
  LazyMotionProvider,
  LightboxProvider,
} from "@httpjpg/ui";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { ConsentGate } from "@/components/providers/consent-gate";
import { ConsentProvider } from "@/components/providers/consent-provider";
import { StoryblokProvider } from "@/components/providers/storyblok-provider";
import { UmamiAnalytics } from "@/components/providers/umami-analytics";
import { ConsoleBanner } from "@/components/ui/console-banner";
import { CustomCursorWrapper } from "@/components/ui/custom-cursor-wrapper";
import { NostalgiaSlideshow } from "@/components/ui/nostalgia-slideshow";
import { PreviewNotification } from "@/components/ui/preview-notification";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AskWidget } from "@/components/widgets/ask-widget";
import { BuildBadge } from "@/components/widgets/build-badge";
import { FooterStatus } from "@/components/widgets/footer-status";
import { NowPlayingWidget } from "@/components/widgets/now-playing-widget";
import { PSNCard } from "@/components/widgets/psn-card";
import { WeatherTime } from "@/components/widgets/weather-time-widget";
import { WebVitalsBadge } from "@/components/widgets/web-vitals-badge";
import { WebVitalsReporter } from "@/components/widgets/web-vitals-reporter";
import { isStoryblokEditor } from "@/lib/is-storyblok-editor";
import { getPageTheme } from "@/lib/page-theme";
import {
  getAuthor,
  getFooterConfig,
  getNavigation,
  getSeoDefaults,
  getSiteConfig,
  getSocialProfiles,
} from "@/lib/queries/config";
import { getLastUpdated } from "@/lib/queries/last-updated";
import { getFeatureFlags, getInterfaceConfig, getWidgetConfig } from "@/lib/queries/widgets";
import { getRecentWork } from "@/lib/queries/work";
import { generatePersonSchema, JsonLd } from "@/lib/schema-org";

import "./globals.css";

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
  const site = await getSiteConfig();
  return {
    title: {
      absolute: seo.title || site.name || "",
      default: seo.title || site.name || "",
      template: site.name ? `%s ${site.name}` : "%s",
    },
    description: seo.description,
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const theme = await getPageTheme();
  const inStoryblokEditor = await isStoryblokEditor();
  const navigation = await getNavigation();
  const footerConfig = await getFooterConfig();
  const widgetConfig = await getWidgetConfig();
  const interfaceConfig = await getInterfaceConfig();
  const site = await getSiteConfig();
  const author = await getAuthor();
  const socialProfiles = await getSocialProfiles();
  const flags = await getFeatureFlags();
  const { projectsWork, websitesWork } = await getRecentWork();
  const lastUpdated = flags.lastUpdatedBadgeEnabled ? await getLastUpdated() : undefined;

  const rawVersion = env.NEXT_PUBLIC_APP_VERSION;
  const version = rawVersion ? formatVersion(rawVersion) : undefined;

  return (
    <html lang={site.htmlLang} data-theme={theme}>
      <body style={{ margin: 0, padding: 0 }}>
        {author && (
          <JsonLd
            data={generatePersonSchema({
              name: author.name,
              url: author.url,
              sameAs: socialProfiles,
            })}
          />
        )}
        <ConsoleBanner repositoryUrl={site.repositoryUrl} />
        {!inStoryblokEditor && <ConsentProvider />}
        <WebVitalsReporter />
        <ScrollToTop />
        <AudioPlayerProvider>
          <LazyMotionProvider>
            <StoryblokProvider>
              <CustomCursorWrapper
                cursorEnabled={interfaceConfig.customCursorEnabled}
                trailEnabled={interfaceConfig.mouseTrailEnabled}
              />
              <ImagePreview />
              {widgetConfig.nostalgiaSlideshowEnabled && <NostalgiaSlideshow />}
              {widgetConfig.spotifyEnabled && <NowPlayingWidget />}
              {widgetConfig.psnEnabled && <PSNCard username={widgetConfig.psnUsername} />}
              {widgetConfig.askEnabled && <AskWidget askEnabled={Boolean(env.GROQ_API_KEY)} />}
              <PreviewNotification />
              <Header
                nav={navigation}
                projectsWork={projectsWork}
                websitesWork={websitesWork}
                showSearch={widgetConfig.askEnabled}
                showScrollVeil={interfaceConfig.headerScrollVeilEnabled}
              />
              <LightboxProvider>
                <Box as="main" css={{ w: "full", minH: "100dvh", color: "pageFg", bg: "pageBg" }}>
                  {children}
                </Box>
              </LightboxProvider>
              <Footer
                backgroundImage={footerConfig.backgroundImage}
                footerLinks={footerConfig.footerLinks}
                copyrightText={footerConfig.copyrightText}
                showCookieSettings
                cookiePolicyHref="/cookie-policy"
                showVersion={Boolean(lastUpdated || version)}
                version={version}
                versionHref={
                  version && site.repositoryUrl
                    ? `${site.repositoryUrl}/releases/tag/${version}`
                    : undefined
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
                    <FooterStatus
                      discordEnabled={widgetConfig.discordEnabled}
                      letterboxdEnabled={widgetConfig.letterboxdEnabled}
                      discogsEnabled={widgetConfig.discogsEnabled}
                      xEnabled={widgetConfig.xEnabled}
                      trophiesEnabled={widgetConfig.psnTrophyEnabled}
                    />
                    <WeatherTime />
                    {flags.webVitalsBadgeEnabled && <WebVitalsBadge />}
                    {flags.buildBadgeEnabled && (
                      <BuildBadge
                        repositoryUrl={site.repositoryUrl}
                        version={version}
                        buildTime={env.NEXT_PUBLIC_BUILD_TIME}
                        commitSha={env.NEXT_PUBLIC_COMMIT_SHA}
                      />
                    )}
                    <AsciiArt
                      label="signoff"
                      css={{ my: "5", opacity: 0.3, fontSize: "xs", letterSpacing: "0.2em" }}
                    >
                      {ASCII_DIVIDER_WAVE}
                    </AsciiArt>
                  </Box>
                }
              />
            </StoryblokProvider>
          </LazyMotionProvider>
        </AudioPlayerProvider>

        {(env.NEXT_PUBLIC_GA_MEASUREMENT_ID || env.NEXT_PUBLIC_UMAMI_ID) && (
          <ConsentGate category="analytics">
            {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
            {env.NEXT_PUBLIC_UMAMI_ID && (
              <UmamiAnalytics
                websiteId={env.NEXT_PUBLIC_UMAMI_ID}
                src={env.NEXT_PUBLIC_UMAMI_SRC}
              />
            )}
          </ConsentGate>
        )}
      </body>
    </html>
  );
}
