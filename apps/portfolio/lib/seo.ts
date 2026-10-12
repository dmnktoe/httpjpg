import { extractPlainText, type StoryblokRichTextNode } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";

type Alternates = NonNullable<Metadata["alternates"]>;

interface StoryShape {
  name: string;
  slug?: string;
  full_slug?: string;
  content?: {
    component?: string;
    title?: string;
    description?: string | { content?: StoryblokRichTextNode[] };
    images?: Array<{ filename?: string; alt?: string; focus?: string }>;
  };
}

interface StoryMetadata {
  title: string;
  description: string;
  ogImage?: { url: string; alt: string };
}

const DESCRIPTION_LIMIT = 160;

export const WORK_FEED_PATH = "/work/feed.xml";

export function extractStoryMetadata(story: StoryShape): StoryMetadata {
  const title = story.content?.title || story.name;

  const desc = story.content?.description;
  const description =
    typeof desc === "string" ? desc : desc ? extractPlainText(desc, DESCRIPTION_LIMIT) : "";

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

/** Restate on every route that sets `alternates`; Next replaces it per segment. */
export function feedAlternates(enabled: boolean): Pick<Alternates, "types"> {
  return enabled ? { types: { "application/rss+xml": WORK_FEED_PATH } } : {};
}

export function toNextMetadata(
  meta: StoryMetadata,
  path: string,
  siteName?: string,
  alternates: Omit<Alternates, "canonical"> = {},
): Metadata {
  const fullTitle = siteName ? `${meta.title} | ${siteName}` : meta.title;
  const ogImages = meta.ogImage
    ? [{ url: meta.ogImage.url, width: 1200, height: 630, alt: meta.ogImage.alt }]
    : undefined;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: path, ...alternates },
    openGraph: {
      title: fullTitle,
      description: meta.description,
      type: "website",
      url: path,
      siteName,
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
