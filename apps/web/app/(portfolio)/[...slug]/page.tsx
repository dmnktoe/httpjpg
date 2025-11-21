import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender } from "@httpjpg/storyblok-utils";
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

  const fullSlug = slug ? slug.join("/") : "";
  const story = await getStory({ slug: fullSlug });

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
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const { getStory } = getStoryblokApi({ draftMode: isEnabled });

  const fullSlug = slug ? slug.join("/") : "";
  const story = await getStory({ slug: fullSlug });

  if (!story) {
    return notFound();
  }

  return <DynamicRender data={story.content} />;
}

/**
 * Generate static params for all Storyblok stories at build time
 */
export async function generateStaticParams() {
  const { getAllSlugs } = getStoryblokApi();

  const slugs = await getAllSlugs({
    starts_with: "", // Get all stories except home
  });

  return slugs
    .filter((item) => !item.isFolder && item.slug !== "home") // Exclude folders and home (root route)
    .map((item) => ({
      slug: item.slug.split("/").filter(Boolean),
    }));
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
