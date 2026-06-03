import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { imagePreset } from "@httpjpg/storyblok-utils";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import ReactDOM from "react-dom";

import { StoryblokLive } from "@/components/providers/storyblok-live";
import { ThemeSync } from "@/components/ui/theme-sync";
import { WorkNav } from "@/components/ui/work-nav";
import { isInternalSlug } from "@/lib/page-theme";
import { getConfig } from "@/lib/queries/config";
import { getFeatureFlags } from "@/lib/queries/widgets";
import { getAdjacentWork, getCachedStory } from "@/lib/queries/work";
import { generateCreativeWorkSchema, JsonLd } from "@/lib/schema-org";
import { extractStoryMetadata, toNextMetadata } from "@/lib/seo";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

const IS_DEV = process.env.NODE_ENV === "development";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const fullSlug = slug ? slug.join("/") : "";

  if (isInternalSlug(fullSlug)) {
    return { title: "Not Found" };
  }

  const story = await getCachedStory(fullSlug, { draftMode: isEnabled || IS_DEV });
  if (!story) {
    return { title: "Not Found" };
  }

  return toNextMetadata(extractStoryMetadata(story), `/${slug?.join("/") || ""}`);
}

/**
 * Catch-all route for Storyblok pages: /work/*, /about, /contact, etc.
 */
export default async function DynamicPage({
  params,
  searchParams,
}: PageProps & {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const { isEnabled } = await draftMode();
  const fullSlug = slug ? slug.join("/") : "";

  if (isInternalSlug(fullSlug)) {
    notFound();
  }

  const isVisualEditor = !!(search._storyblok || search._draft);
  const needsLivePreview = isEnabled || isVisualEditor;
  const fetchDraft = needsLivePreview || IS_DEV;

  try {
    const story = await getCachedStory(fullSlug, { draftMode: fetchDraft });
    if (!story) {
      return notFound();
    }

    if (needsLivePreview) {
      return <StoryblokLive story={story} />;
    }

    const isWorkPage = story.content?.component === "work";
    const flags = await getFeatureFlags();

    let schemaMarkup = null;
    let adjacent: Awaited<ReturnType<typeof getAdjacentWork>> = {};

    if (isWorkPage) {
      const config = await getConfig();
      const author = config?.author_name
        ? {
            "@type": "Person" as const,
            name: config.author_name,
            url: config.author_url,
          }
        : undefined;

      const meta = extractStoryMetadata(story);
      const images = story.content?.images?.map((img: { filename: string; focus?: string }) =>
        imagePreset.og(img.filename, img.focus),
      );
      const firstImage = story.content?.images?.[0];

      schemaMarkup = generateCreativeWorkSchema({
        name: meta.title,
        description: meta.description || undefined,
        image: images?.[0] || images,
        url: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${fullSlug}`,
        datePublished: story.first_published_at,
        dateModified: story.published_at,
        author,
      });

      if (firstImage?.filename) {
        ReactDOM.preload(imagePreset.og(firstImage.filename, firstImage.focus), {
          as: "image",
          fetchPriority: "high",
        });
      }

      if (flags.prevNextWorkEnabled) {
        adjacent = await getAdjacentWork(story.slug);
      }
    }

    const pageTheme = story.content?.isDark ? "dark" : "light";

    return (
      <>
        <ThemeSync theme={pageTheme} />
        {schemaMarkup && <JsonLd data={schemaMarkup} />}
        <StoryblokServerComponent blok={story.content} />
        {isWorkPage && flags.prevNextWorkEnabled && (
          <WorkNav prev={adjacent.prev} next={adjacent.next} />
        )}
      </>
    );
  } catch (error) {
    console.error(`[DynamicPage] Error loading story "${fullSlug}":`, {
      error: error instanceof Error ? error.message : String(error),
      slug: fullSlug,
      fetchDraft,
    });
    throw error;
  }
}

export async function generateStaticParams() {
  try {
    const { getAllSlugs } = getStoryblokApi();
    const slugs = await getAllSlugs({ starts_with: "" });
    return slugs
      .filter((item) => !item.isFolder && item.slug !== STORYBLOK_SLUGS.HOME)
      .map((item) => ({
        slug: item.slug.split("/").filter(Boolean),
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    captureServerException(error, { tags: { route: "generateStaticParams" } });
    return [];
  }
}

export const revalidate = 3600;
export const dynamicParams = true;
