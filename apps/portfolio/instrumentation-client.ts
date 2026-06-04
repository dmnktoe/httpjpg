import { initSentryClient, onRouterTransitionStart } from "@httpjpg/observability/sentry/client.ts";

// Runs before app code on the client so Sentry's browser tracing is active for
// the initial `pageload` transaction — this is what populates the Web Vitals
// dashboard (LCP/FCP/CLS/INP/TTFB are measured during early load).
initSentryClient();

export { onRouterTransitionStart };
