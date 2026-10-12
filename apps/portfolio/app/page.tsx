import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { readStory } from "@httpjpg/storyblok-next";
import { imagePreset, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, unstable_rethrow } from "next/navigation";

import { StoryblokLive } from "@/components/providers/storyblok-live";
import { ThemeSync } from "@/components/ui/theme-sync";
import { getSeoDefaults, getSiteConfig } from "@/lib/queries/config";
import { getSearchIndex } from "@/lib/queries/search-index";
import { getFeatureFlags } from "@/lib/queries/widgets";
import { generateCollectionPageSchema, JsonLd, schemaIds, toGraph } from "@/lib/schema-org";
import { feedAlternates } from "@/lib/seo";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

/** Blocking, like the root layout; draft reads wait for request time. */
export const instant = false;

/** The start page lists work; past this the ItemList stops adding signal. */
const MAX_LISTED_WORK = 30;

export async function generateMetadata(): Promise<Metadata> {
  const flags = await getFeatureFlags();
  const ogImage = `/api/og/${STORYBLOK_SLUGS.HOME}`;
  return {
    alternates: { canonical: "/", ...feedAlternates(flags.rssFeedEnabled) },
    openGraph: { url: "/", images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = await searchParams;
  const { isEnabled } = await draftMode();

  const isVisualEditor = search._storyblok || search._draft;
  const isDraft = Boolean(isEnabled || isVisualEditor);

  const story = await readStory(STORYBLOK_SLUGS.HOME, {
    draft: isDraft,
    relations: [STORYBLOK_RELATIONS.WORK_LIST],
  });

  if (!story) {
    return notFound();
  }

  if (isDraft) {
    return <StoryblokLive story={story} />;
  }

  const pageTheme = story.content?.isDark ? "dark" : "light";
  const schema = await buildHomeSchema();

  return (
    <>
      <ThemeSync theme={pageTheme} />
      {schema && <JsonLd data={schema} />}
      <StoryblokServerComponent blok={story.content} />
    </>
  );
}

async function buildHomeSchema() {
  const [site, seo] = await Promise.all([getSiteConfig(), getSeoDefaults()]);
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const name = seo.title || site.name;
  if (!name) {
    return null;
  }

  let documents: Awaited<ReturnType<typeof getSearchIndex>> = [];
  try {
    documents = await getSearchIndex();
  } catch (error) {
    unstable_rethrow(error);
    // Structured data is a nice-to-have; the page renders without the list.
    captureServerException(error, { tags: { route: "home", feature: "schema" } });
  }

  const items = documents
    .filter((doc) => doc.kind === "work" && doc.href.startsWith("/"))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, MAX_LISTED_WORK)
    .map((doc) => ({
      name: doc.title,
      url: `${base}${doc.href}`,
      ...(doc.featured ? { image: imagePreset.og(doc.featured.source, doc.featured.focus) } : {}),
    }));

  return toGraph([
    generateCollectionPageSchema({
      url: `${base}/`,
      name,
      description: seo.description,
      items,
      isPartOf: site.name ? { "@id": schemaIds(base).website } : undefined,
    }),
  ]);
}
