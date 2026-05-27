import * as Sentry from "@sentry/nextjs";

import { getSentryConfig } from "./config";

export function initSentryServer() {
  const { dsn, environment, release, isProduction, isEnabled } = getSentryConfig("server");
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

export type WebVitalName = "CLS" | "FID" | "FCP" | "LCP" | "TTFB" | "INP";
export type WebVitalRating = "good" | "needs-improvement" | "poor";

export interface WebVitalReport {
  name: WebVitalName;
  value: number;
  rating?: WebVitalRating;
  id?: string;
  pathname?: string;
  userAgent?: string;
  navigationType?: string;
}

const MAX_PATHNAME_LENGTH = 500;

export function captureWebVital(metric: WebVitalReport) {
  const { name, value, rating, id, userAgent, navigationType } = metric;
  const pathname = metric.pathname?.slice(0, MAX_PATHNAME_LENGTH);

  Sentry.withScope((scope) => {
    scope.setTag("vital.name", name);
    scope.setTag("vital.source", "web-vitals-route");
    if (rating) {
      scope.setTag("vital.rating", rating);
    }
    if (pathname) {
      scope.setTag("vital.pathname", pathname);
    }
    scope.setContext("web_vital", {
      name,
      value,
      rating,
      id,
      pathname,
      userAgent,
      navigationType,
    });
    scope.setLevel(rating === "poor" ? "warning" : "info");
    scope.setFingerprint(["web-vital", name]);
    Sentry.captureMessage(`[vital] ${name}=${value.toFixed(2)}`);
  });
}

export { Sentry };
