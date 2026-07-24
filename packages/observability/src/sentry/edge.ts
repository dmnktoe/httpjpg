import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryEdge() {
  const { dsn, environment, release, isProduction, isEnabled } = getSentryConfig("edge");
  if (!dsn || !isEnabled || Sentry.getClient()) {
    return;
  }
  Sentry.init({
    dsn,
    environment,
    release,
    enabled: isEnabled,
    attachStacktrace: true,
    normalizeDepth: 5,
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
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("custom", context);
    }
    Sentry.captureException(error);
  });
}

export { Sentry };
