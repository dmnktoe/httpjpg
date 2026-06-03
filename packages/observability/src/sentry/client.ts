import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryClient() {
  const { dsn, environment, release, isProduction, isEnabled } = getSentryConfig("client");
  if (!dsn || !isEnabled) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    enabled: isEnabled,
    sendDefaultPii: false,
    attachStacktrace: true,
    normalizeDepth: 5,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isProduction ? 0.01 : 0.1,
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i],
    ignoreErrors: [
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      "ComboSearch",
      "atomicFindClose",
      "fb_xd_fragment",
      "NetworkError",
      "Failed to fetch",
      "Load failed",
      "ResizeObserver loop completed with undelivered notifications",
      "ResizeObserver loop limit exceeded",
    ],
    beforeSend(event) {
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

export function captureClientException(
  error: unknown,
  context?: Parameters<typeof Sentry.captureException>[1],
) {
  Sentry.captureException(error, context);
}

export { Sentry };
