/**
 * Storyblok Environment Configuration
 *
 * Required environment variables for Storyblok integration:
 *
 * NEXT_PUBLIC_STORYBLOK_TOKEN - Public access token for published content
 * STORYBLOK_PREVIEW_TOKEN - Preview token for draft content (optional, only needed for preview)
 * STORYBLOK_PREVIEW_SECRET - Secret for securing draft mode API
 * STORYBLOK_REVALIDATE_SECRET - Secret for webhook revalidation
 * NEXT_PUBLIC_STORYBLOK_VERSION - Content version (draft or published)
 */

// Validate required Storyblok environment variables
export function validateStoryblokEnv() {
  const required = [
    "NEXT_PUBLIC_STORYBLOK_TOKEN",
    "STORYBLOK_PREVIEW_SECRET",
    "STORYBLOK_REVALIDATE_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Storyblok environment variables: ${missing.join(", ")}`,
    );
  }
}

// Run validation in development
if (process.env.NODE_ENV === "development") {
  validateStoryblokEnv();
}

/**
 * Storyblok configuration
 */
export const storyblokConfig = {
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || "",
  previewToken: process.env.STORYBLOK_PREVIEW_TOKEN,
  version: (process.env.NEXT_PUBLIC_STORYBLOK_VERSION || "published") as
    | "draft"
    | "published",
  region: "eu" as const,
  previewSecret: process.env.STORYBLOK_PREVIEW_SECRET || "",
  revalidateSecret: process.env.STORYBLOK_REVALIDATE_SECRET || "",
} as const;
