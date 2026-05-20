import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryEdge() {
  const { dsn, environment, isProduction, isEnabled } = getSentryConfig("edge");
  if (!isEnabled) {
    return;
  }
  Sentry.init({
    dsn,
    environment,
    enabled: isEnabled,
    tracesSampleRate: isProduction ? 0.05 : 1.0,
    debug: false,
    integrations: [],
    ignoreErrors: ["ECONNRESET", "ETIMEDOUT", "NetworkError"],
    beforeSend(event) {
      event.contexts = { ...event.contexts, runtime: { name: "Edge" } };
      return event;
    },
  });
}

export function captureEdgeException(error: unknown, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext("custom", context);
  }
  Sentry.captureException(error);
}

export { Sentry };
