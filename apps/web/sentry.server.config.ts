import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  enabled: IS_PRODUCTION,

  // Performance Monitoring - lower in production to reduce quota usage
  tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

  // Debug mode - completely disable in development
  debug: false,

  // Integrations for server-side
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.extraErrorDataIntegration({
      depth: 10, // Capture more context
    }),
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
    // Log errors in development
    if (!IS_PRODUCTION) {
      console.error("Sentry error (not sent in dev):", hint.originalException);
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
