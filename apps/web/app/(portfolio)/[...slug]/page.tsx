import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender, getSlugWithAppName } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Generate metadata for dynamic Storyblok pages
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const { getStory } = getStoryblokApi({ draftMode: isEnabled });

  const fullSlug = getSlugWithAppName({
    slug: slug ? slug.join("/") : "",
  });

  const story = await getStory({ slug: fullSlug });

  if (!story) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: story.name,
    description: story.content?.description || "",
  };
}

/**
 * Dynamic catch-all route for Storyblok content
 */
export default async function StoryblokPage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const { getStory } = getStoryblokApi({ draftMode: isEnabled });

  const fullSlug = getSlugWithAppName({
    slug: slug ? slug.join("/") : "",
  });

  const story = await getStory({ slug: fullSlug });

  if (!story) {
    return notFound();
  }

  return <DynamicRender data={story.content} />;
}

/**
 * Generate static params for all Storyblok stories
 */
export async function generateStaticParams() {
  const { getAllSlugs } = getStoryblokApi();

  const slugs = await getAllSlugs({
    starts_with: "", // Get all stories
  });

  return slugs
    .filter((item) => !item.isFolder)
    .map((item) => ({
      slug: item.slug.split("/").filter(Boolean),
    }));
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
