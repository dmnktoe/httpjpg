"use client";

import { useEffect } from "react";

/**
 * Initialize observability services on the client-side
 */
export function ObservabilityProvider() {
  useEffect(() => {
    // Initialize Sentry - use dynamic import to avoid bundling server code
    const initSentry = async () => {
      const { initSentryClient } = await import(
        "@httpjpg/observability/sentry/client.ts"
      );
      initSentryClient();
    };
    initSentry();

    // Initialize Datadog
    const initDatadog = async () => {
      const { initDatadogRum, initDatadogLogs } = await import(
        "@httpjpg/observability/datadog"
      );
      initDatadogRum();
      initDatadogLogs();
    };
    initDatadog();
  }, []);

  return null;
}
