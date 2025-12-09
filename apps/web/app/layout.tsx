import { config } from "@httpjpg/config";
import { env } from "@httpjpg/env";
import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import { Box, ImagePreview, LazyMotionProvider } from "@httpjpg/ui";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { ConsentProvider } from "../components/providers/consent-provider";
import { ObservabilityProvider } from "../components/providers/observability-provider";
import { StoryblokProvider } from "../components/providers/storyblok-provider";
import { ThemeProvider } from "../components/providers/theme-provider";
import { CustomCursorWrapper } from "../components/ui/custom-cursor-wrapper";
import { PreviewNotification } from "../components/ui/preview-notification";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import { ThemedFooter } from "../components/ui/themed-footer";
import { ThemedHeader } from "../components/ui/themed-header";
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
          <ThemeProvider>
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
              <ThemedHeader
                nav={navigation}
                personalWork={personalWork}
                clientWork={clientWork}
              />

              {/* Main Content Area - NO container wrapper here
                  Pages must use Container/Section components themselves
                  This allows for full-width sections and controlled breakouts */}
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

              {/* Footer - always full width */}
              <ThemedFooter
                backgroundImage={footerConfig.backgroundImage}
                footerLinks={footerConfig.footerLinks}
                copyrightText={footerConfig.copyrightText}
              />
            </StoryblokProvider>
          </ThemeProvider>
        </LazyMotionProvider>

        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
