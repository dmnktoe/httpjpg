import { extractPlainText, imagePreset } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";

interface StoryShape {
  name: string;
  content?: {
    title?: string;
    description?: string | { content?: unknown[] };
    images?: Array<{ filename?: string; alt?: string; focus?: string }>;
  };
}

interface StoryMetadata {
  title: string;
  description: string;
  ogImage?: { url: string; alt: string };
}

const APP_NAME = "httpjpg";
const DESCRIPTION_LIMIT = 160;

/**
 * Extract title / description / OG image from a Storyblok story for
 * Next's `generateMetadata`. Description falls through `string |
 * richtext | undefined`; OG image uses the first content image.
 */
export function extractStoryMetadata(story: StoryShape): StoryMetadata {
  const title = story.content?.title || story.name;

  const desc = story.content?.description;
  const description =
    typeof desc === "string"
      ? desc
      : desc
        ? extractPlainText(desc as { content?: any[] }, DESCRIPTION_LIMIT)
        : "";

  const firstImage = story.content?.images?.[0];
  const ogImage = firstImage?.filename
    ? {
        url: imagePreset.og(firstImage.filename, firstImage.focus),
        alt: firstImage.alt || title,
      }
    : undefined;

  return { title, description, ogImage };
}

/**
 * Build the Next `Metadata` object from extracted story metadata + a path.
 * Keeps OG title/description/url/twitter shape in one place.
 */
export function toNextMetadata(meta: StoryMetadata, path: string): Metadata {
  const fullTitle = `${meta.title} | ${APP_NAME}`;
  const ogImages = meta.ogImage
    ? [{ url: meta.ogImage.url, width: 1200, height: 630, alt: meta.ogImage.alt }]
    : undefined;
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: fullTitle,
      description: meta.description,
      type: "website",
      url: path,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage.url] : undefined,
    },
  };
}
