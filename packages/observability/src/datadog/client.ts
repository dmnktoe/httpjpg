import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

/**
 * Datadog Real User Monitoring (RUM) and Logs Integration
 *
 * Client-side monitoring for performance, errors, and user behavior tracking.
 */

interface DatadogConfig {
  applicationId: string;
  clientToken: string;
  site: string;
  service: string;
  env: string;
  version?: string;
  sessionSampleRate?: number;
  sessionReplaySampleRate?: number;
  trackUserInteractions?: boolean;
  trackResources?: boolean;
  trackLongTasks?: boolean;
  defaultPrivacyLevel?: "mask" | "mask-user-input" | "allow";
}

/**
 * Get Datadog configuration from environment variables
 */
function getDatadogConfig(): DatadogConfig | null {
  // Check if Datadog is enabled
  const enableInDev =
    process.env.NEXT_PUBLIC_DATADOG_ENABLE_IN_DEV === "1" ||
    process.env.NEXT_PUBLIC_DATADOG_ENABLE_IN_DEV === "true";

  if (process.env.NODE_ENV === "development" && !enableInDev) {
    return null;
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const site = process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.eu";
  const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME || "httpjpg-web";

  if (!applicationId || !clientToken) {
    console.warn(
      "Datadog configuration missing. Set NEXT_PUBLIC_DATADOG_APPLICATION_ID and NEXT_PUBLIC_DATADOG_CLIENT_TOKEN.",
    );
    return null;
  }

  return {
    applicationId,
    clientToken,
    site,
    service,
    env: process.env.NODE_ENV || "development",
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  };
}

/**
 * Initialize Datadog Real User Monitoring (RUM)
 *
 * Tracks page views, user interactions, errors, and performance metrics.
 * Includes Session Replay for debugging.
 */
export function initDatadogRum(): void {
  const config = getDatadogConfig();

  if (!config) {
    console.log("Datadog RUM initialization skipped");
    return;
  }

  // Check if already initialized
  if (datadogRum.getInitConfiguration()) {
    return;
  }

  try {
    datadogRum.init({
      applicationId: config.applicationId,
      clientToken: config.clientToken,
      site: config.site,
      service: config.service,
      env: config.env,
      version: config.version,
      sessionSampleRate: config.sessionSampleRate,
      sessionReplaySampleRate: config.sessionReplaySampleRate,
      trackUserInteractions: config.trackUserInteractions,
      trackResources: config.trackResources,
      trackLongTasks: config.trackLongTasks,
      defaultPrivacyLevel: config.defaultPrivacyLevel,
    });

    // Start session replay recording
    datadogRum.startSessionReplayRecording();

    console.log("Datadog RUM initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Datadog RUM:", error);
  }
}

/**
 * Initialize Datadog Logs
 *
 * Captures client-side logs and sends them to Datadog.
 */
export function initDatadogLogs(): void {
  const config = getDatadogConfig();

  if (!config) {
    console.log("Datadog Logs initialization skipped");
    return;
  }

  // Check if already initialized
  if (datadogLogs.getInitConfiguration()) {
    return;
  }

  try {
    datadogLogs.init({
      clientToken: config.clientToken,
      site: config.site,
      service: config.service,
      env: config.env,
      version: config.version,
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });

    console.log("Datadog Logs initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Datadog Logs:", error);
  }
}

/**
 * Set Datadog user context
 *
 * Associates RUM events with a specific user.
 *
 * @example
 * ```ts
 * setDatadogUser({
 *   id: "user-123",
 *   name: "John Doe",
 *   email: "john@example.com"
 * });
 * ```
 */
export function setDatadogUser(user: {
  id: string;
  name?: string;
  email?: string;
}): void {
  try {
    datadogRum.setUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Failed to set Datadog user:", error);
  }
}

/**
 * Clear Datadog user context
 *
 * Removes user identification from RUM events.
 */
export function clearDatadogUser(): void {
  try {
    datadogRum.clearUser();
  } catch (error) {
    console.error("Failed to clear Datadog user:", error);
  }
}

/**
 * Track custom action
 *
 * @example
 * ```ts
 * trackAction("button_click", {
 *   button: "submit",
 *   form: "contact"
 * });
 * ```
 */
export function trackAction(
  name: string,
  context?: Record<string, unknown>,
): void {
  try {
    datadogRum.addAction(name, context);
  } catch (error) {
    console.error("Failed to track action:", error);
  }
}

/**
 * Track error
 *
 * @example
 * ```ts
 * trackError(new Error("Something went wrong"), {
 *   source: "api",
 *   endpoint: "/api/data"
 * });
 * ```
 */
export function trackError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  try {
    datadogRum.addError(error, context);
  } catch (error) {
    console.error("Failed to track error:", error);
  }
}

/**
 * Datadog logger instance
 *
 * @example
 * ```ts
 * import { logger } from "@httpjpg/observability/datadog";
 *
 * logger.info("User logged in", { userId: "123" });
 * logger.error("API call failed", { error: err });
 * ```
 */
export const logger = datadogLogs.logger;

/**
 * Re-export Datadog RUM and Logs for advanced usage
 */
export { datadogLogs, datadogRum };
