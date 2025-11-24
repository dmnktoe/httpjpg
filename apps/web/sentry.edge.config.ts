import { env } from "@httpjpg/env";
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = env.SENTRY_DSN;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  enabled: IS_PRODUCTION,

  // Performance Monitoring - Edge functions should be lightweight
  tracesSampleRate: IS_PRODUCTION ? 0.05 : 1.0,

  // Debug mode - completely disable to reduce console noise
  debug: false,

  // Edge-specific: Minimal integrations for performance
  integrations: [],

  // Filter out noise
  ignoreErrors: ["ECONNRESET", "ETIMEDOUT", "NetworkError"],

  beforeSend(event) {
    if (!IS_PRODUCTION) {
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
