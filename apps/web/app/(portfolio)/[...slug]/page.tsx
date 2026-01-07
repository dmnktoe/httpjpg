import { config } from "@httpjpg/config";
import { CACHE_TAGS, getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getConfig } from "../../../lib/get-config";
import { generateCreativeWorkSchema, JsonLd } from "../../../lib/schema-org";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Fetch story with caching
 * In draft mode: Direct fetch with preview token (no cache)
 * In PHP-like mode: Direct fetch (no cache, classic behavior)
 * In production: Cached fetch with ISR (1 hour revalidation)
 */
const fetchStoryWithCache = async (fullSlug: string, isDraft: boolean) => {
  try {
    // Draft mode or PHP-like mode: Always fetch fresh
    if (isDraft || config.features.phpLikeNavigation) {
      const { getStory } = getStoryblokApi({ draftMode: isDraft });
      return await getStory({
        slug: fullSlug,
        resolve_relations: [STORYBLOK_RELATIONS.WORK_LIST],
      });
    }

    // Modern mode: Use ISR cache with revalidation tags
    return unstable_cache(
      async () => {
        const { getStory } = getStoryblokApi();
        return await getStory({
          slug: fullSlug,
          resolve_relations: [STORYBLOK_RELATIONS.WORK_LIST],
        });
      },
      [`story-${fullSlug}`],
      {
        tags: [CACHE_TAGS.STORY(fullSlug), CACHE_TAGS.STORIES],
        revalidate: 3600, // 1 hour
      },
    )();
  } catch (error) {
    // Let notFound() handle 404s, re-throw other errors
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
};

/**
 * Generate metadata for dynamic Storyblok pages
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();

  const fullSlug = slug ? slug.join("/") : "";

  // Filter out browser/framework internal routes early
  if (
    fullSlug.startsWith("__nextjs") ||
    fullSlug.startsWith("_next") ||
    fullSlug.startsWith(".well-known") ||
    fullSlug.includes("/.well-known/")
  ) {
    return {
      title: "Not Found",
    };
  }

  const story = await fetchStoryWithCache(fullSlug, isEnabled);

  if (!story) {
    return {
      title: "Not Found",
    };
  }

  // Extract description from rich text content or use plain description
  let description = "";
  if (story.content?.description) {
    if (typeof story.content.description === "string") {
      description = story.content.description;
    } else if (story.content.description.content) {
      // Extract plain text from rich text structure
      description = extractPlainTextFromRichText(story.content.description);
    }
  }

  // Get the first image for OG image
  const ogImage = story.content?.images?.[0]?.filename
    ? `${story.content.images[0].filename}/m/1200x630/smart`
    : undefined;

  const pageTitle = story.content?.title || story.name;
  const fullTitle = `${pageTitle} | httpjpg`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: `/${slug?.join("/") || ""}`,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: story.content?.images?.[0]?.alt || pageTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/**
 * Extract plain text from Storyblok rich text structure
 */
function extractPlainTextFromRichText(richText: any): string {
  if (!richText?.content) {
    return "";
  }

  const extractText = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          return node.text;
        }
        if (node.content) {
          return extractText(node.content);
        }
        return "";
      })
      .join(" ")
      .trim();
  };

  return extractText(richText.content).slice(0, 160); // Limit to 160 chars for SEO
}

/**
 * Dynamic catch-all route for all Storyblok pages
 * Handles: /work/*, /about, /contact, etc.
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

  // Filter out Next.js/browser internal routes early (before Storyblok fetch)
  if (
    fullSlug.startsWith("__nextjs") ||
    fullSlug.startsWith("_next") ||
    fullSlug.startsWith(".well-known") ||
    fullSlug.includes("/.well-known/")
  ) {
    notFound();
  }

  // Check if we're in Visual Editor mode (has _storyblok param or _draft param)
  const isVisualEditor = !!(search._storyblok || search._draft);
  const isDraft = isEnabled || isVisualEditor;

  try {
    const story = await fetchStoryWithCache(fullSlug, isDraft);

    if (!story) {
      return notFound();
    }

    // Use live preview for draft mode (enables live editing in Visual Editor)
    if (isDraft) {
      const { StoryblokLivePreview } = await import(
        "../../../components/providers/storyblok-live-preview"
      );
      return <StoryblokLivePreview story={story} />;
    }

    // Check if this is a work page (component type is "work")
    const isWorkPage = story.content?.component === "work";

    // Generate Schema.org JSON-LD for work pages
    let schemaMarkup = null;
    if (isWorkPage) {
      // Get author info from config
      const config = await getConfig();
      const author = config?.author_name
        ? {
            "@type": "Person" as const,
            name: config.author_name,
            url: config.author_url,
          }
        : undefined;

      const pageTitle = story.content?.title || story.name;
      const description = story.content?.description
        ? typeof story.content.description === "string"
          ? story.content.description
          : extractPlainTextFromRichText(story.content.description)
        : undefined;

      const images = story.content?.images?.map(
        (img: any) => `${img.filename}/m/1200x630/smart`,
      );

      schemaMarkup = generateCreativeWorkSchema({
        name: pageTitle,
        description,
        image: images?.[0] || images,
        url: `https://httpjpg.com/${fullSlug}`,
        datePublished: story.first_published_at,
        dateModified: story.published_at,
        author,
      });
    }

    // Static render for production
    return (
      <>
        {schemaMarkup && <JsonLd data={schemaMarkup} />}
        <DynamicRender data={story.content} />
      </>
    );
  } catch (error) {
    console.error(`[DynamicPage] Error loading story "${fullSlug}":`, {
      error: error instanceof Error ? error.message : String(error),
      slug: fullSlug,
      isDraft,
    });
    throw error; // Let Next.js error boundary handle it
  }
}

/**
 * Generate static params for all Storyblok stories at build time
 * Only used when phpLikeNavigation is disabled (ISR mode)
 */
export async function generateStaticParams() {
  if (config.features.phpLikeNavigation) {
    return []; // Skip static generation in PHP-like mode
  }

  try {
    const { getAllSlugs } = getStoryblokApi();

    const slugs = await getAllSlugs({
      starts_with: "", // Get all stories except home
    });

    return slugs
      .filter((item) => !item.isFolder && item.slug !== "home") // Exclude folders and home (root route)
      .map((item) => ({
        slug: item.slug.split("/").filter(Boolean),
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return []; // Return empty array on error to allow fallback rendering
  }
}

// Route Segment Config
// Next.js 15 doesn't support conditional expressions in route segment configs
// Optimized for modern mode (ISR with revalidation)
// PHP-like mode behavior is handled via:
// - No caching in fetchStoryWithCache when phpLikeNavigation is true
// - No static params generation in generateStaticParams
// - Native <a> tags in Link/NavLink components (no prefetch)
export const dynamic = "auto";
export const revalidate = 3600; // 1 hour (only applies to modern mode with ISR)
export const dynamicParams = true;
