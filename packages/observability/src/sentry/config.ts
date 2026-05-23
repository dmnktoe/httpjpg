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
  const release = process.env.GITHUB_SHA ?? process.env.npm_package_version ?? undefined;
  const isProduction = environment === "production";
  return {
    dsn,
    environment,
    release,
    isProduction,
    isEnabled: Boolean(dsn) && (isProduction || Boolean(enableInDev)),
  };
}
