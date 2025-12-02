import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { env } from "@httpjpg/env";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_DATADOG_ENABLE_IN_DEV === "1";

const isEnabled = IS_PRODUCTION || ENABLE_IN_DEV;

/**
 * Initialize Datadog Real User Monitoring (RUM)
 */
export function initDatadogRum() {
  // Check if already initialized
  if (
    typeof window !== "undefined" &&
    (window as any).DD_RUM?.isInitialized?.()
  ) {
    console.log("Datadog RUM already initialized, skipping...");
    return;
  }

  if (
    !env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ||
    !env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  ) {
    console.warn("Datadog RUM: Missing credentials, skipping initialization");
    return;
  }

  if (!isEnabled) {
    console.log(
      "Datadog RUM disabled (not in production and DATADOG_ENABLE_IN_DEV not set)",
    );
    return;
  }

  datadogRum.init({
    applicationId: env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    clientToken: env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: env.NEXT_PUBLIC_DATADOG_SITE,
    service: env.NEXT_PUBLIC_DATADOG_SERVICE_NAME,
    env: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local",

    // Performance & Session tracking
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    trackBfcacheViews: true,

    // Privacy
    defaultPrivacyLevel: "mask-user-input",

    // Debugging
    enableExperimentalFeatures: !IS_PRODUCTION,
    allowedTracingUrls: [
      { match: env.NEXT_PUBLIC_APP_URL, propagatorTypes: ["tracecontext"] },
      {
        match: /https:\/\/.*\.storyblok\.com/,
        propagatorTypes: ["tracecontext"],
      },
    ],

    beforeSend: () => {
      // Filter out development events if not explicitly enabled
      if (!isEnabled) {
        return false;
      }
      return true;
    },
  });

  // Start session replay recording
  datadogRum.startSessionReplayRecording();
}

/**
 * Initialize Datadog Browser Logs
 */
export function initDatadogLogs() {
  // Check if already initialized
  if (
    typeof window !== "undefined" &&
    (window as any).DD_LOGS?.isInitialized?.()
  ) {
    console.log("Datadog Logs already initialized, skipping...");
    return;
  }

  if (!env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    console.warn("Datadog Logs: Missing client token, skipping initialization");
    return;
  }

  if (!isEnabled) {
    console.log(
      "Datadog Logs disabled (not in production and DATADOG_ENABLE_IN_DEV not set)",
    );
    return;
  }

  datadogLogs.init({
    clientToken: env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: env.NEXT_PUBLIC_DATADOG_SITE,
    service: env.NEXT_PUBLIC_DATADOG_SERVICE_NAME,
    env: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local",

    // Forward logs to console in development
    forwardConsoleLogs: !IS_PRODUCTION ? "all" : ["error"],
    forwardErrorsToLogs: true,

    // Session tracking
    sessionSampleRate: IS_PRODUCTION ? 20 : 100,

    beforeSend: () => {
      // Filter out development logs if not explicitly enabled
      if (!isEnabled) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Set user context for Datadog tracking
 */
export function setDatadogUser(user: {
  id: string;
  name?: string;
  email?: string;
  [key: string]: string | number | boolean | undefined;
}) {
  datadogRum.setUser(user);
}

/**
 * Clear user context
 */
export function clearDatadogUser() {
  datadogRum.clearUser();
}

/**
 * Add custom action tracking
 */
export function trackAction(name: string, context?: Record<string, unknown>) {
  datadogRum.addAction(name, context);
}

/**
 * Add custom error tracking
 */
export function trackError(error: Error, context?: Record<string, unknown>) {
  datadogRum.addError(error, context);
}

/**
 * Log messages to Datadog
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    datadogLogs.logger.debug(message, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    datadogLogs.logger.info(message, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    datadogLogs.logger.warn(message, context);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    datadogLogs.logger.error(message, context);
  },
};

export { datadogRum, datadogLogs };
