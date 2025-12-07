// Load root .env.local file (only in Node.js, not Edge/client)
if (typeof window === "undefined") {
  try {
    require("./load-env.js");
  } catch {
    // Silently fail in Edge runtime
  }
}

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const skipValidation =
  !!process.env.SKIP_ENV_VALIDATION &&
  process.env.SKIP_ENV_VALIDATION !== "false" &&
  process.env.SKIP_ENV_VALIDATION !== "0";

export const env = createEnv({
  skipValidation,
  server: {
    // Server-only variables (never exposed to client)

    // Storyblok
    STORYBLOK_PREVIEW_TOKEN: z
      .string()
      .min(1, "STORYBLOK_PREVIEW_TOKEN is required for draft mode"),
    STORYBLOK_PREVIEW_SECRET: z
      .string()
      .min(1, "STORYBLOK_PREVIEW_SECRET is required for draft mode"),
    STORYBLOK_REVALIDATE_SECRET: z
      .string()
      .min(1, "STORYBLOK_REVALIDATE_SECRET is required for webhooks"),
    STORYBLOK_MANAGEMENT_TOKEN: z.string().optional(),
    STORYBLOK_SPACE_ID: z.string().optional(),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_ENABLE_IN_DEV: z
      .string()
      .optional()
      .transform((val) => val === "1" || val === "true")
      .default("false"),

    // Datadog
    DATADOG_APPLICATION_ID: z
      .string()
      .default("b955edbf-b1ef-4ef6-9343-a41c3fe69007"),
    DATADOG_CLIENT_TOKEN: z
      .string()
      .default("pub9831ce019f5374ab97d4956488e0e684"),
    DATADOG_SITE: z.string().default("datadoghq.eu"),
    DATADOG_SERVICE_NAME: z.string().default("httpjpg"),
    DATADOG_ENABLE_IN_DEV: z
      .string()
      .optional()
      .transform((val) => val === "1" || val === "true")
      .default("false"),

    // Spotify
    SPOTIFY_CLIENT_ID: z.string().min(1, "SPOTIFY_CLIENT_ID is required"),
    SPOTIFY_CLIENT_SECRET: z
      .string()
      .min(1, "SPOTIFY_CLIENT_SECRET is required"),
    SPOTIFY_REFRESH_TOKEN: z
      .string()
      .min(1, "SPOTIFY_REFRESH_TOKEN is required"),

    // Arcjet
    ARCJET_KEY: z.string().min(1, "ARCJET_KEY is required"),

    // Codecov
    CODECOV_TOKEN: z.string().optional(),

    // GitHub
    GITHUB_TOKEN: z.string().optional(),

    // Node.js
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {
    // Client-side variables (must start with NEXT_PUBLIC_)

    // App
    NEXT_PUBLIC_APP_URL: z.string().url(),

    // Storyblok
    NEXT_PUBLIC_STORYBLOK_API_URL: z
      .string()
      .url()
      .default("https://api.storyblok.com/v2/cdn"),
    NEXT_PUBLIC_STORYBLOK_TOKEN: z.string().min(1),
    NEXT_PUBLIC_STORYBLOK_VERSION: z
      .enum(["draft", "published"])
      .default("published"),

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().default("G-H4TMWSN63E"),

    // Sentry (client-accessible)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Datadog (client-accessible)
    NEXT_PUBLIC_DATADOG_APPLICATION_ID: z.string().optional(),
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
    NEXT_PUBLIC_DATADOG_SITE: z.string().default("datadoghq.eu"),
    NEXT_PUBLIC_DATADOG_SERVICE_NAME: z.string().default("httpjpg"),

    // Vercel (automatically set by Vercel)
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["production", "preview", "development"])
      .optional(),
  },
  runtimeEnv: {
    // Server - Storyblok
    STORYBLOK_PREVIEW_TOKEN: process.env.STORYBLOK_PREVIEW_TOKEN,
    STORYBLOK_PREVIEW_SECRET: process.env.STORYBLOK_PREVIEW_SECRET,
    STORYBLOK_REVALIDATE_SECRET: process.env.STORYBLOK_REVALIDATE_SECRET,
    STORYBLOK_MANAGEMENT_TOKEN: process.env.STORYBLOK_MANAGEMENT_TOKEN,
    STORYBLOK_SPACE_ID: process.env.STORYBLOK_SPACE_ID,

    // Server - Sentry
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_ENABLE_IN_DEV: process.env.SENTRY_ENABLE_IN_DEV,

    // Server - Datadog
    DATADOG_APPLICATION_ID: process.env.DATADOG_APPLICATION_ID,
    DATADOG_CLIENT_TOKEN: process.env.DATADOG_CLIENT_TOKEN,
    DATADOG_SITE: process.env.DATADOG_SITE,
    DATADOG_SERVICE_NAME: process.env.DATADOG_SERVICE_NAME,
    DATADOG_ENABLE_IN_DEV: process.env.DATADOG_ENABLE_IN_DEV,

    // Server - Spotify
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,

    // Server - Arcjet
    ARCJET_KEY: process.env.ARCJET_KEY,

    // Server - Codecov
    CODECOV_TOKEN: process.env.CODECOV_TOKEN,

    // Server - GitHub
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,

    // Server - Node.js
    NODE_ENV: process.env.NODE_ENV,

    // Client - App
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // Client - Storyblok
    NEXT_PUBLIC_STORYBLOK_API_URL: process.env.NEXT_PUBLIC_STORYBLOK_API_URL,
    NEXT_PUBLIC_STORYBLOK_TOKEN: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    NEXT_PUBLIC_STORYBLOK_VERSION: process.env.NEXT_PUBLIC_STORYBLOK_VERSION,

    // Client - Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

    // Client - Sentry
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Client - Datadog
    NEXT_PUBLIC_DATADOG_APPLICATION_ID:
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN:
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    NEXT_PUBLIC_DATADOG_SITE: process.env.NEXT_PUBLIC_DATADOG_SITE,
    NEXT_PUBLIC_DATADOG_SERVICE_NAME:
      process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME,

    // Client - Vercel
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
});
