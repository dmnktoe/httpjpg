import { env } from "@httpjpg/env";

export type SentryScope = "client" | "server" | "edge";

export interface SentryRuntimeConfig {
  dsn: string | undefined;
  environment: string | undefined;
  release: string | undefined;
  isProduction: boolean;
  isEnabled: boolean;
}

export function getSentryConfig(scope: SentryScope): SentryRuntimeConfig {
  const isServer = scope === "server";
  const dsn = isServer ? env.SENTRY_DSN : env.NEXT_PUBLIC_SENTRY_DSN;
  const enableInDev = isServer ? env.SENTRY_ENABLE_IN_DEV : env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV;
  const environment = isServer ? env.NODE_ENV : process.env.NODE_ENV;
  // Prefer the build-time app version; npm_package_version is the "0.0.0" placeholder.
  const release =
    env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    process.env.GITHUB_SHA?.trim() ||
    process.env.npm_package_version?.trim() ||
    undefined;
  const isProduction = environment === "production";
  return {
    dsn,
    environment,
    release,
    isProduction,
    isEnabled: Boolean(dsn) && (isProduction || Boolean(enableInDev)),
  };
}
