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
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isProduction ? 0.01 : 0.1,
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

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUser() {
  Sentry.setUser(null);
}

export { Sentry };
