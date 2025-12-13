import { config } from "@httpjpg/config";
import { env } from "@httpjpg/env";
import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import { Box, Header, ImagePreview, LazyMotionProvider } from "@httpjpg/ui";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { ConsentProvider } from "../components/providers/consent-provider";
import { ObservabilityProvider } from "../components/providers/observability-provider";
import { StoryblokProvider } from "../components/providers/storyblok-provider";
import { CustomCursorWrapper } from "../components/ui/custom-cursor-wrapper";
import { FooterWrapper } from "../components/ui/footer-wrapper";
import { PreviewNotification } from "../components/ui/preview-notification";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import { NowPlayingWidget } from "../components/widgets/now-playing-widget";
import { PSNCard } from "../components/widgets/psn-card";
import { WebVitalsReporter } from "../components/widgets/web-vitals-reporter";
import {
  getFooterConfig,
  getNavigation,
  getRecentWork,
  getWidgetConfig,
} from "../lib/get-config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    absolute: config.appName,
    default: config.appName,
    template: `%s ${config.appName}`,
  },
  description:
    "Personal portfolio showcasing creative work, design, and development projects",
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

/**
 * Root Layout
 * - Loads Panda CSS styles
 * - Initializes Storyblok Bridge for Visual Editor
 * - Google Analytics integration
 * - Fixed Header and Footer
 * - Dynamic Navigation from Storyblok
 *
 * IMPORTANT: This layout provides the shell (Header/Footer/Global UI).
 * Content is rendered WITHOUT automatic containers - pages/sections
 * must handle their own Container/Section components for proper
 * full-width breakouts and responsive layouts.
 */
export default async function RootLayout({ children }: PropsWithChildren) {
  const navigation = await getNavigation();
  const footerConfig = await getFooterConfig();
  const widgetConfig = await getWidgetConfig();
  const { personalWork, clientWork } = await getRecentWork();

  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#ffffff" }}>
        <ConsentProvider />
        <ObservabilityProvider />
        <WebVitalsReporter />
        <ScrollToTop />
        <LazyMotionProvider>
          <StoryblokProvider>
            {/* Global UI Elements (not affected by page containers) */}
            <CustomCursorWrapper />
            <ImagePreview />
            {widgetConfig.spotifyEnabled && <NowPlayingWidget />}
            {widgetConfig.psnEnabled && (
              <PSNCard username={widgetConfig.psnUsername} />
            )}
            <PreviewNotification />

            {/* Sticky Header - always full width, pushes content down naturally */}
            <Header
              nav={navigation}
              personalWork={personalWork}
              clientWork={clientWork}
            />

            {/* Main Content Area - NO container wrapper here
                Pages must use Container/Section components themselves
                This allows for full-width sections and controlled breakouts */}
            {config.features.phpLikeNavigation ? (
              // PHP-like: Block rendering until content is ready
              <Suspense>
                <Box
                  as="main"
                  css={{
                    bg: "white",
                    w: "full",
                    minH: "100vh",
                  }}
                >
                  {children}
                </Box>
              </Suspense>
            ) : (
              // Modern SPA: Stream content as it becomes available
              <Box
                as="main"
                css={{
                  bg: "white",
                  w: "full",
                  minH: "100vh",
                }}
              >
                {children}
              </Box>
            )}

            {/* Footer - always full width */}
            <FooterWrapper
              backgroundImage={footerConfig.backgroundImage}
              footerLinks={footerConfig.footerLinks}
              copyrightText={footerConfig.copyrightText}
            />
          </StoryblokProvider>
        </LazyMotionProvider>

        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
