import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.SENTRY_DSN;
const IS_PRODUCTION = env.NODE_ENV === "production";
const ENABLE_IN_DEV = env.SENTRY_ENABLE_IN_DEV;

const isEnabled = IS_PRODUCTION || ENABLE_IN_DEV;

/**
 * Initialize Sentry for server-side error tracking
 */
export function initSentryServer() {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || env.NODE_ENV,
    enabled: isEnabled,

    // Performance Monitoring - lower in production to reduce quota usage
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

    // Debug mode - completely disable in development
    debug: false,

    // Integrations for server-side
    integrations: [
      // Integrations are auto-included in @sentry/nextjs
    ],

    // Filter out noise
    ignoreErrors: [
      // Next.js specific
      "ENOENT",
      "ECONNRESET",
      "EPIPE",
      // Storyblok API errors that are handled
      "Error fetching story",
      "Error fetching stories",
    ],

    // Add server context
    beforeSend(event, hint) {
      // Log errors in development unless explicitly enabled
      if (!isEnabled) {
        console.error(
          "Sentry error (not sent - disabled):",
          hint.originalException,
        );
        return null;
      }

      // Add server-specific context
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: "Node.js",
          version: process.version,
        },
      };

      return event;
    },
  });
}

/**
 * Capture a server-side exception
 */
export function captureServerException(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  if (context?.tags) {
    Sentry.setTags(context.tags);
  }
  if (context?.extra) {
    Sentry.setContext("custom", context.extra);
  }
  Sentry.captureException(error);
}

export { Sentry };
