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
    STORYBLOK_PREVIEW_TOKEN: z.string().optional(),
    STORYBLOK_PREVIEW_SECRET: z.string().optional(),
    STORYBLOK_REVALIDATE_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
  },
  client: {
    // Client-side variables (must start with NEXT_PUBLIC_)
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STORYBLOK_API_URL: z
      .string()
      .url()
      .default("https://api.storyblok.com/v2/cdn"),
    NEXT_PUBLIC_STORYBLOK_TOKEN: z.string().min(1),
    NEXT_PUBLIC_STORYBLOK_VERSION: z
      .enum(["draft", "published"])
      .default("published"),
    NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER: z.string().default("portfolio"),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  },
  runtimeEnv: {
    // Server
    STORYBLOK_PREVIEW_TOKEN: process.env.STORYBLOK_PREVIEW_TOKEN,
    STORYBLOK_PREVIEW_SECRET: process.env.STORYBLOK_PREVIEW_SECRET,
    STORYBLOK_REVALIDATE_SECRET: process.env.STORYBLOK_REVALIDATE_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STORYBLOK_API_URL: process.env.NEXT_PUBLIC_STORYBLOK_API_URL,
    NEXT_PUBLIC_STORYBLOK_TOKEN: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    NEXT_PUBLIC_STORYBLOK_VERSION: process.env.NEXT_PUBLIC_STORYBLOK_VERSION,
    NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER:
      process.env.NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
});
