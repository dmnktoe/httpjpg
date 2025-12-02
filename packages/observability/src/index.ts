/**
 * @httpjpg/observability
 *
 * Centralized observability package for error tracking and monitoring.
 * Supports Sentry and Datadog integrations.
 *
 * @example Sentry (Client)
 * ```ts
 * import { initSentryClient, captureClientException } from "@httpjpg/observability/sentry";
 *
 * initSentryClient();
 * captureClientException(error);
 * ```
 *
 * @example Sentry (Server)
 * ```ts
 * import { initSentryServer, captureServerException } from "@httpjpg/observability/sentry";
 *
 * initSentryServer();
 * captureServerException(error, { tags: { source: "api" } });
 * ```
 *
 * @example Datadog
 * ```ts
 * import { initDatadogRum, trackAction } from "@httpjpg/observability/datadog";
 *
 * initDatadogRum();
 * trackAction("button_click", { button: "submit" });
 * ```
 */

export * from "./datadog";
// Re-export all integrations
export * from "./sentry";
