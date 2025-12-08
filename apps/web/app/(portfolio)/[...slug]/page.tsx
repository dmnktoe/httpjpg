import { CACHE_TAGS, getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Fetch story with caching
 * In draft mode: Direct fetch with preview token (no cache)
 * In production: Cached fetch with ISR (1 hour revalidation)
 */
const fetchStoryWithCache = async (fullSlug: string, isDraft: boolean) => {
  try {
    // Draft mode: Always fetch fresh with preview token
    if (isDraft) {
      const { getStory } = getStoryblokApi({ draftMode: true });
      return await getStory({
        slug: fullSlug,
        resolve_relations: [STORYBLOK_RELATIONS.WORK_LIST],
      });
    }

    // Production: Use ISR cache with revalidation tags
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
    description: description || `Portfolio work: ${pageTitle}`,
    openGraph: {
      title: fullTitle,
      description: description || `Portfolio work: ${pageTitle}`,
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
      description: description || `Portfolio work: ${pageTitle}`,
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

  // Check if we're in Visual Editor mode (has _storyblok param or _draft param)
  const isVisualEditor = !!(search._storyblok || search._draft);
  const isDraft = isEnabled || isVisualEditor;

  const fullSlug = slug ? slug.join("/") : "";

  try {
    const story = await fetchStoryWithCache(fullSlug, isDraft);

    if (!story) {
      return notFound();
    }

    // Extract isDark from story content for theme support
    const isDarkMode = story.content?.isDark === true;

    // Use live preview for draft mode (enables live editing in Visual Editor)
    if (isDraft) {
      const { StoryblokLivePreview } = await import(
        "../../../components/providers/storyblok-live-preview"
      );
      const { ThemeWrapper } = await import(
        "../../../components/ui/theme-wrapper"
      );
      return (
        <ThemeWrapper isDark={isDarkMode}>
          <StoryblokLivePreview story={story} />
        </ThemeWrapper>
      );
    }

    // Static render for production with theme wrapper
    const { ThemeWrapper } = await import(
      "../../../components/ui/theme-wrapper"
    );
    return (
      <ThemeWrapper isDark={isDarkMode}>
        <DynamicRender data={story.content} />
      </ThemeWrapper>
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
 */
export async function generateStaticParams() {
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

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour

// Enable dynamic params for stories created after build
export const dynamicParams = true;
