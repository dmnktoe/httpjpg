import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.NEXT_PUBLIC_SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "1";

const isEnabled = IS_PRODUCTION || ENABLE_IN_DEV;

/**
 * Initialize Sentry for Edge Runtime error tracking
 */
export function initSentryEdge() {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    enabled: isEnabled,

    // Performance Monitoring - Edge functions should be lightweight
    tracesSampleRate: IS_PRODUCTION ? 0.05 : 1.0,

    // Debug mode - completely disable to reduce console noise
    debug: false,

    // Edge-specific: Minimal integrations for performance
    integrations: [],

    // Filter out noise
    ignoreErrors: ["ECONNRESET", "ETIMEDOUT", "NetworkError"],

    beforeSend(event) {
      if (!isEnabled) {
        return null;
      }

      // Add edge runtime context
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: "Edge",
        },
      };

      return event;
    },
  });
}

/**
 * Capture an Edge runtime exception
 */
export function captureEdgeException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (context) {
    Sentry.setContext("custom", context);
  }
  Sentry.captureException(error);
}

export { Sentry };
