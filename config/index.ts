import type { Config } from "./types";

export const config = {
  appName: "㋡httpjpg.com",
  // Frontend
  ui: {
    // the themes that should be available in the app
    enabledThemes: ["light", "dark"],
    // the default theme
    defaultTheme: "light",
  },
  // Feature Flags
  features: {
    /**
     * PHP-like Navigation (Traditional Full Page Reloads)
     *
     * Set to `true` for classic web behavior:
     * - Full page reloads on every navigation
     * - Server-side rendering for all content
     * - No loading indicators during navigation
     * - Content fully ready before page is shown
     *
     * Set to `false` for modern SPA behavior:
     * - Fast client-side navigation
     * - Progressive content streaming
     * - Loading indicators during transitions
     * - Incremental Static Regeneration where configured
     */
    phpLikeNavigation: false,
  },
} as const satisfies Config;

export type { Config };
