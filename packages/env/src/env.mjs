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
    STORYBLOK_API_ENDPOINT: z.string().url().optional(),

    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ENABLE_IN_DEV: boolFromString,

    SPOTIFY_CLIENT_ID: z.string().min(1, "SPOTIFY_CLIENT_ID is required"),
    SPOTIFY_CLIENT_SECRET: z.string().min(1, "SPOTIFY_CLIENT_SECRET is required"),
    SPOTIFY_REFRESH_TOKEN: z.string().min(1, "SPOTIFY_REFRESH_TOKEN is required"),

    PSN_NPSSO: z.string().optional(),

    STRAVA_CLIENT_ID: z.string().optional(),
    STRAVA_CLIENT_SECRET: z.string().optional(),
    STRAVA_REFRESH_TOKEN: z.string().optional(),

    WEATHER_LATITUDE: z.coerce.number().default(51.3127),
    WEATHER_LONGITUDE: z.coerce.number().default(9.4797),

    TWEETAPI_API_URL: z.string().url().default("https://api.tweetapi.com/tw-v2"),
    TWEETAPI_KEY: z.string().optional(),

    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.enum(["openai/gpt-oss-20b", "openai/gpt-oss-120b"]).default("openai/gpt-oss-20b"),

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
    NEXT_PUBLIC_BUILD_TIME: z.string().optional(),
    NEXT_PUBLIC_COMMIT_SHA: z.string().optional(),

    NEXT_PUBLIC_WEATHER_TIMEZONE: z.string().default("Europe/Berlin"),
  },
  runtimeEnv: {
    STORYBLOK_PREVIEW_TOKEN: process.env.STORYBLOK_PREVIEW_TOKEN,
    STORYBLOK_PREVIEW_SECRET: process.env.STORYBLOK_PREVIEW_SECRET,
    STORYBLOK_REVALIDATE_SECRET: process.env.STORYBLOK_REVALIDATE_SECRET,
    STORYBLOK_MANAGEMENT_TOKEN: process.env.STORYBLOK_MANAGEMENT_TOKEN,
    STORYBLOK_SPACE_ID: process.env.STORYBLOK_SPACE_ID,
    STORYBLOK_API_ENDPOINT: process.env.STORYBLOK_API_ENDPOINT,

    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENABLE_IN_DEV: process.env.SENTRY_ENABLE_IN_DEV,

    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,

    PSN_NPSSO: process.env.PSN_NPSSO,

    STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
    STRAVA_REFRESH_TOKEN: process.env.STRAVA_REFRESH_TOKEN,

    WEATHER_LATITUDE: process.env.WEATHER_LATITUDE,
    WEATHER_LONGITUDE: process.env.WEATHER_LONGITUDE,

    TWEETAPI_API_URL: process.env.TWEETAPI_API_URL,
    TWEETAPI_KEY: process.env.TWEETAPI_KEY,

    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,

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
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
    NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,

    NEXT_PUBLIC_WEATHER_TIMEZONE: process.env.NEXT_PUBLIC_WEATHER_TIMEZONE,
  },
});
