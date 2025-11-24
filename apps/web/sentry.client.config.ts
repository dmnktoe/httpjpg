import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  enabled: IS_PRODUCTION,

  // Performance Monitoring - lower sample rate in production
  tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

  // Debug mode - completely disable to reduce console noise
  debug: false,

  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of errors
  replaysSessionSampleRate: IS_PRODUCTION ? 0.01 : 0.1, // Lower in production

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration({
      // Track Next.js page loads and navigations
      enableInp: true,
    }),
  ],

  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Random plugins/extensions
    "ComboSearch",
    "atomicFindClose",
    // Facebook borked
    "fb_xd_fragment",
    // Network errors
    "NetworkError",
    "Failed to fetch",
    "Load failed",
  ],

  // Add user context
  beforeSend(event) {
    // Filter out errors in development
    if (!IS_PRODUCTION) {
      console.log("Sentry event (not sent in dev):", event);
      return null;
    }

    // Add additional context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        "User-Agent": navigator.userAgent,
      };
    }

    return event;
  },
});
