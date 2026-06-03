import { extractPlainText } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";

interface StoryShape {
  name: string;
  slug?: string;
  full_slug?: string;
  content?: {
    component?: string;
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

export function extractStoryMetadata(story: StoryShape): StoryMetadata {
  const title = story.content?.title || story.name;

  const desc = story.content?.description;
  const description =
    typeof desc === "string"
      ? desc
      : desc
        ? extractPlainText(desc as Parameters<typeof extractPlainText>[0], DESCRIPTION_LIMIT)
        : "";

  const firstImage = story.content?.images?.[0];
  // Fall back to slug for stories where Storyblok didn't return full_slug,
  // but keep the work/ prefix so the dynamic handler can resolve the story.
  const path =
    story.full_slug ||
    (story.slug && (story.content?.component === "work" ? `work/${story.slug}` : story.slug));

  let ogImage: StoryMetadata["ogImage"];
  if (path) {
    ogImage = { url: `/api/og/${path}`, alt: firstImage?.alt || title };
  }

  return { title, description, ogImage };
}

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
