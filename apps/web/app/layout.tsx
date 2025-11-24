import { config } from "@httpjpg/config";
import { env } from "@httpjpg/env";
import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";
import { Footer, Header } from "@httpjpg/ui";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { PreviewNotification } from "../components/preview-notification";
import { getFooterConfig, getNavigation } from "../lib/get-config";
import { StoryblokProvider } from "./storyblok-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    absolute: config.appName,
    default: config.appName,
    template: `%s | ${config.appName}`,
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
 */
export default async function RootLayout({ children }: PropsWithChildren) {
  const navigation = await getNavigation();
  const footerConfig = await getFooterConfig();

  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#ffffff" }}>
        <StoryblokProvider>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #000000",
            }}
          >
            <Header
              nav={navigation}
              personalWork={[]}
              clientWork={[]}
              isDark={false}
            />
          </div>

          <main
            style={{
              minHeight: "calc(100vh - 280px - 80px)",
              paddingTop: "0",
              paddingBottom: "80px",
              background: "#ffffff",
            }}
          >
            {children}
          </main>

          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              zIndex: 40,
            }}
          >
            <Footer
              backgroundImage={footerConfig.backgroundImage}
              showDefaultLinks={footerConfig.showDefaultLinks}
            >
              <div style={{ fontSize: "0.875rem" }}>
                {footerConfig.copyrightText ||
                  `© ${new Date().getFullYear()} httpjpg. All rights reserved.`}
              </div>
            </Footer>
          </div>

          {/* Preview Mode Notification Banner */}
          <PreviewNotification />
        </StoryblokProvider>

        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
