import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryServer() {
  const { dsn, environment, isProduction, isEnabled } = getSentryConfig("server");
  Sentry.init({
    dsn,
    environment,
    enabled: isEnabled,
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
  if (context?.tags) {
    Sentry.setTags(context.tags);
  }
  if (context?.extra) {
    Sentry.setContext("custom", context.extra);
  }
  Sentry.captureException(error);
}

export { Sentry };
