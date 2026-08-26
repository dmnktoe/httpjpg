import { env } from "@httpjpg/env";
import { imagePreset } from "@httpjpg/storyblok-utils";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokLive } from "@/components/providers/storyblok-live";
import { RelatedWork } from "@/components/ui/related-work";
import { ThemeSync } from "@/components/ui/theme-sync";
import { WorkNav } from "@/components/ui/work-nav";
import { isInternalSlug } from "@/lib/page-theme";
import { getAuthor, getSiteConfig, getSocialProfiles } from "@/lib/queries/config";
import { getRelatedWork } from "@/lib/queries/related-work";
import { getFeatureFlags } from "@/lib/queries/widgets";
import { getAdjacentWork, getCachedStory } from "@/lib/queries/work";
import { generateCreativeWorkSchema, JsonLd } from "@/lib/schema-org";
import { extractStoryMetadata, toNextMetadata } from "@/lib/seo";

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

  const site = await getSiteConfig();
  return toNextMetadata(extractStoryMetadata(story), `/${slug?.join("/") || ""}`, site.name);
}

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

  let story;
  try {
    story = await getCachedStory(fullSlug, { draftMode: fetchDraft });
  } catch (error) {
    console.error(`[DynamicPage] Error loading story "${fullSlug}":`, {
      error: error instanceof Error ? error.message : String(error),
      slug: fullSlug,
      fetchDraft,
    });
    throw error;
  }

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
  let related: Awaited<ReturnType<typeof getRelatedWork>> = { tags: [], related: [] };

  if (isWorkPage) {
    const site = await getSiteConfig();
    const siteAuthor = await getAuthor();
    const author = siteAuthor
      ? {
          "@type": "Person" as const,
          name: siteAuthor.name,
          url: siteAuthor.url,
          sameAs: await getSocialProfiles(),
        }
      : undefined;

    const meta = extractStoryMetadata(story);
    const images = story.content?.images?.map((img: { filename: string; focus?: string }) =>
      imagePreset.og(img.filename, img.focus),
    );

    schemaMarkup = generateCreativeWorkSchema({
      name: meta.title,
      description: meta.description || undefined,
      image: images?.[0] || images,
      url: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${fullSlug}`,
      datePublished: story.first_published_at,
      dateModified: story.published_at,
      author,
      inLanguage: site.language,
    });

    [adjacent, related] = await Promise.all([
      flags.prevNextWorkEnabled ? getAdjacentWork(story.slug) : Promise.resolve({}),
      flags.relatedWorkEnabled ? getRelatedWork(`/${fullSlug}`) : Promise.resolve(related),
    ]);
  }

  const pageTheme = story.content?.isDark ? "dark" : "light";

  return (
    <>
      <ThemeSync theme={pageTheme} />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
      <StoryblokServerComponent blok={story.content} />
      {isWorkPage && flags.relatedWorkEnabled && (
        <RelatedWork {...related} isPreview={fetchDraft} />
      )}
      {isWorkPage && flags.prevNextWorkEnabled && (
        <WorkNav prev={adjacent.prev} next={adjacent.next} />
      )}
    </>
  );
}

export const dynamic = "force-dynamic";
