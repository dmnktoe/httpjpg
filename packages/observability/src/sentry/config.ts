import { env } from "@httpjpg/env";

export type SentryScope = "client" | "server" | "edge";

export interface SentryRuntimeConfig {
  dsn: string | undefined;
  environment: string | undefined;
  isProduction: boolean;
  isEnabled: boolean;
}

/**
 * Resolve DSN + enabled-flag pair for a Sentry runtime.
 *
 * Server reads `SENTRY_DSN` and `SENTRY_ENABLE_IN_DEV`; client and edge
 * read the `NEXT_PUBLIC_*` variants since they ship in the browser bundle.
 */
export function getSentryConfig(scope: SentryScope): SentryRuntimeConfig {
  const isServer = scope === "server";
  const dsn = isServer ? env.SENTRY_DSN : env.NEXT_PUBLIC_SENTRY_DSN;
  const enableInDev = isServer ? env.SENTRY_ENABLE_IN_DEV : env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV;
  const environment = isServer ? env.NODE_ENV : process.env.NODE_ENV;
  const isProduction = environment === "production";
  return {
    dsn,
    environment,
    isProduction,
    // No DSN → no init; this guards initSentryServer/Edge which don't check DSN.
    isEnabled: Boolean(dsn) && (isProduction || Boolean(enableInDev)),
  };
}
