/**
 * Datadog Integration (Disabled)
 *
 * Datadog is currently disabled due to type incompatibilities with @datadog/browser-rum.
 * Re-enable when types are stable or use runtime-only implementation.
 */

/**
 * Initialize Datadog Real User Monitoring (RUM)
 * @deprecated Datadog is currently disabled
 */
export function initDatadogRum() {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Datadog RUM is currently disabled");
  }
}

/**
 * Initialize Datadog Logs
 * @deprecated Datadog is currently disabled
 */
export function initDatadogLogs() {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Datadog Logs is currently disabled");
  }
}

/**
 * Set Datadog user context
 * @deprecated Datadog is currently disabled
 */
export function setDatadogUser(_user: {
  id: string;
  name?: string;
  email?: string;
}) {
  // Disabled
}

/**
 * Clear Datadog user context
 * @deprecated Datadog is currently disabled
 */
export function clearDatadogUser() {
  // Disabled
}

/**
 * Track custom action
 * @deprecated Datadog is currently disabled
 */
export function trackAction(_name: string, _context?: Record<string, unknown>) {
  // Disabled
}

/**
 * Track error
 * @deprecated Datadog is currently disabled
 */
export function trackError(_error: Error, _context?: Record<string, unknown>) {
  // Disabled
}

/**
 * Datadog logger stub
 * @deprecated Datadog is currently disabled
 */
export const logger = {
  debug: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
};

/**
 * Datadog stubs for compatibility
 * @deprecated Datadog is currently disabled
 */
export const datadogRum = {
  init: () => {},
  startSessionReplayRecording: () => {},
  setUser: () => {},
  removeUser: () => {},
  addAction: () => {},
  addError: () => {},
};

export const datadogLogs = {
  init: () => {},
  logger: logger,
};
