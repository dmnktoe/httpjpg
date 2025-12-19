export type Config = {
  appName: string;
  ui: {
    enabledThemes: Array<"light" | "dark">;
    defaultTheme: Config["ui"]["enabledThemes"][number];
  };
  features: {
    /**
     * Enable PHP-like full page navigation behavior
     * When enabled:
     * - Uses native <a> tags (no Next.js client-side routing)
     * - Forces SSR (Server-Side Rendering) on all pages
     * - Disables loading.tsx components
     * - Blocks rendering until all content is ready (via Suspense)
     *
     * When disabled:
     * - Uses Next.js Link with client-side navigation
     * - Uses ISR (Incremental Static Regeneration) where configured
     * - Shows loading states during navigation
     * - Streams content as it becomes available
     *
     * @default false
     */
    phpLikeNavigation: boolean;
  };
};
