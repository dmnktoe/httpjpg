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

    // Sentry
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

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
    NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER: z.string().default("portfolio"),

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

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

    // Server - Sentry
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,

    // Server - Node.js
    NODE_ENV: process.env.NODE_ENV,

    // Client - App
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // Client - Storyblok
    NEXT_PUBLIC_STORYBLOK_API_URL: process.env.NEXT_PUBLIC_STORYBLOK_API_URL,
    NEXT_PUBLIC_STORYBLOK_TOKEN: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    NEXT_PUBLIC_STORYBLOK_VERSION: process.env.NEXT_PUBLIC_STORYBLOK_VERSION,
    NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER:
      process.env.NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER,

    // Client - Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

    // Client - Vercel
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
});
