// NEXT_RUNTIME gate keeps load-env.js out of Edge bundles (uses process.cwd).
if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
  try {
    require("./load-env.js");
  } catch {}
}

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const skipValidation =
  !!process.env.SKIP_ENV_VALIDATION &&
  process.env.SKIP_ENV_VALIDATION !== "false" &&
  process.env.SKIP_ENV_VALIDATION !== "0";

const boolFromString = z
  .string()
  .optional()
  .transform((val) => {
    const v = val?.trim().toLowerCase();
    return v === "1" || v === "true";
  })
  .default("false");

export const env = createEnv({
  skipValidation,
  server: {
    STORYBLOK_PREVIEW_TOKEN: z.string().min(1, "STORYBLOK_PREVIEW_TOKEN is required"),
    STORYBLOK_PREVIEW_SECRET: z.string().min(1, "STORYBLOK_PREVIEW_SECRET is required"),
    STORYBLOK_REVALIDATE_SECRET: z.string().min(1, "STORYBLOK_REVALIDATE_SECRET is required"),
    STORYBLOK_MANAGEMENT_TOKEN: z.string().optional(),
    STORYBLOK_SPACE_ID: z.string().optional(),

    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_ENABLE_IN_DEV: boolFromString,

    SPOTIFY_CLIENT_ID: z.string().min(1, "SPOTIFY_CLIENT_ID is required"),
    SPOTIFY_CLIENT_SECRET: z.string().min(1, "SPOTIFY_CLIENT_SECRET is required"),
    SPOTIFY_REFRESH_TOKEN: z.string().min(1, "SPOTIFY_REFRESH_TOKEN is required"),

    DISCORD_USER_ID: z.string().optional(),

    PSN_NPSSO: z.string().optional(),

    WEATHER_LATITUDE: z.coerce.number().default(51.3127),
    WEATHER_LONGITUDE: z.coerce.number().default(9.4797),

    ARCJET_KEY: z.string().optional(),

    CODECOV_TOKEN: z.string().optional(),
    ANALYZE_BUNDLE: z.enum(["true", "false"]).optional(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),

    NEXT_PUBLIC_STORYBLOK_TOKEN: z.string().min(1),
    NEXT_PUBLIC_STORYBLOK_VERSION: z.enum(["draft", "published"]).default("published"),

    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: boolFromString,

    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().default("G-H4TMWSN63E"),

    NEXT_PUBLIC_UMAMI_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_SRC: z.string().url().default("https://cloud.umami.is/script.js"),

    NEXT_PUBLIC_APP_VERSION: z.string().optional(),

    NEXT_PUBLIC_WEATHER_TIMEZONE: z.string().default("Europe/Berlin"),
  },
  runtimeEnv: {
    STORYBLOK_PREVIEW_TOKEN: process.env.STORYBLOK_PREVIEW_TOKEN,
    STORYBLOK_PREVIEW_SECRET: process.env.STORYBLOK_PREVIEW_SECRET,
    STORYBLOK_REVALIDATE_SECRET: process.env.STORYBLOK_REVALIDATE_SECRET,
    STORYBLOK_MANAGEMENT_TOKEN: process.env.STORYBLOK_MANAGEMENT_TOKEN,
    STORYBLOK_SPACE_ID: process.env.STORYBLOK_SPACE_ID,

    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_ENABLE_IN_DEV: process.env.SENTRY_ENABLE_IN_DEV,

    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,

    DISCORD_USER_ID: process.env.DISCORD_USER_ID,

    PSN_NPSSO: process.env.PSN_NPSSO,

    WEATHER_LATITUDE: process.env.WEATHER_LATITUDE,
    WEATHER_LONGITUDE: process.env.WEATHER_LONGITUDE,

    ARCJET_KEY: process.env.ARCJET_KEY,

    CODECOV_TOKEN: process.env.CODECOV_TOKEN,
    ANALYZE_BUNDLE: process.env.ANALYZE_BUNDLE,

    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    NEXT_PUBLIC_STORYBLOK_TOKEN: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    NEXT_PUBLIC_STORYBLOK_VERSION: process.env.NEXT_PUBLIC_STORYBLOK_VERSION,

    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV,

    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

    NEXT_PUBLIC_UMAMI_ID: process.env.NEXT_PUBLIC_UMAMI_ID,
    NEXT_PUBLIC_UMAMI_SRC: process.env.NEXT_PUBLIC_UMAMI_SRC,

    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,

    NEXT_PUBLIC_WEATHER_TIMEZONE: process.env.NEXT_PUBLIC_WEATHER_TIMEZONE,
  },
});
