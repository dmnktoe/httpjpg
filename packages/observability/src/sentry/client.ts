import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.NEXT_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "1";

const isEnabled = IS_PRODUCTION || ENABLE_IN_DEV;

/**
 * Initialize Sentry for client-side (browser) error tracking
 */
export function initSentryClient() {
  if (!SENTRY_DSN) {
    console.warn("Sentry Client: Missing DSN, skipping initialization");
    return;
  }

  if (!isEnabled) {
    console.log(
      "Sentry Client disabled (not in production and SENTRY_ENABLE_IN_DEV not set)",
    );
    return;
  }

  console.log("Initializing Sentry Client...", {
    dsn: SENTRY_DSN,
    enabled: isEnabled,
  });

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    enabled: isEnabled,

    // Performance Monitoring - lower sample rate in production
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // Debug mode - completely disable to reduce console noise
    debug: false,

    // Session Replay
    replaysOnErrorSampleRate: 1.0, // Capture 100% of errors
    replaysSessionSampleRate: IS_PRODUCTION ? 0.01 : 0.1, // Lower in production

    integrations: [
      // Integrations are auto-included in @sentry/nextjs
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
      // Filter out errors in development unless explicitly enabled
      if (!isEnabled) {
        console.log("Sentry event (not sent - disabled):", event);
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
}

/**
 * Capture a client-side exception
 */
export function captureClientException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (context) {
    Sentry.setContext("custom", context);
  }
  Sentry.captureException(error);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

export { Sentry };
