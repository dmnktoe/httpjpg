import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryServer() {
  const { dsn, environment, release, isProduction, isEnabled } = getSentryConfig("server");
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
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: false,
    ignoreErrors: [
      "ENOENT",
      "ECONNRESET",
      "EPIPE",
      "Error fetching story",
      "Error fetching stories",
    ],
    beforeSend(event) {
      event.contexts = {
        ...event.contexts,
        runtime: { name: "Node.js", version: process.version },
      };
      return event;
    },
  });
}

export function captureServerException(
  error: unknown,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> },
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      for (const [key, value] of Object.entries(context.tags)) {
        scope.setTag(key, value);
      }
    }
    if (context?.extra) {
      scope.setContext("custom", context.extra);
    }
    Sentry.captureException(error);
  });
}

export { Sentry };
