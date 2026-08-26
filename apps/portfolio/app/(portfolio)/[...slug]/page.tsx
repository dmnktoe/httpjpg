import { env } from "@httpjpg/env";
import { imagePreset } from "@httpjpg/storyblok-utils";
import { Box } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokLive } from "@/components/providers/storyblok-live";
import { LanguagePicker } from "@/components/ui/language-picker";
import { LocaleSync } from "@/components/ui/locale-sync";
import { RelatedWork } from "@/components/ui/related-work";
import { ThemeSync } from "@/components/ui/theme-sync";
import { WorkNav } from "@/components/ui/work-nav";
import {
  type AppLocale,
  LOCALIZED_SLUGS,
  localeAlternates,
  localizedPath,
  ogLocale,
  resolvePageLocale,
  schemaLanguage,
  storyblokLanguageParam,
} from "@/lib/locale";
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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const IS_DEV = process.env.NODE_ENV === "development";

function storyOpts(draftModeEnabled: boolean, locale: AppLocale) {
  const language = storyblokLanguageParam(locale);
  return language ? { draftMode: draftModeEnabled, language } : { draftMode: draftModeEnabled };
}

async function resolvePageRequest(
  params: PageProps["params"],
  searchParams: PageProps["searchParams"],
) {
  const { slug: segments } = await params;
  const search = searchParams ? await searchParams : {};
  const { isEnabled } = await draftMode();
  const isVisualEditor = Boolean(search._storyblok || search._draft);
  const { locale, slug } = resolvePageLocale({
    segments,
    storyblokLang: search._storyblok_lang,
    visualEditor: isVisualEditor,
  });
  const fetchDraft = isEnabled || isVisualEditor || IS_DEV;
  return { locale, slug, fetchDraft, isVisualEditor, isEnabled };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug, fetchDraft } = await resolvePageRequest(params, searchParams);

  if (isInternalSlug(slug)) {
    return { title: "Not Found" };
  }

  const story = await getCachedStory(slug, storyOpts(fetchDraft, locale));
  if (!story) {
    return { title: "Not Found" };
  }

  const site = await getSiteConfig();
  const path = localizedPath(locale, slug);
  const metadata = toNextMetadata(extractStoryMetadata(story), path, site.name);
  const languages = localeAlternates(slug);
  if (!languages) {
    return metadata;
  }
  return {
    ...metadata,
    alternates: { canonical: path, languages },
    openGraph: {
      ...metadata.openGraph,
      locale: ogLocale(locale),
    },
  };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { locale, slug, fetchDraft, isVisualEditor, isEnabled } = await resolvePageRequest(
    params,
    searchParams,
  );

  if (isInternalSlug(slug)) {
    notFound();
  }

  const livePreview = isEnabled || isVisualEditor;

  let story;
  try {
    story = await getCachedStory(slug, storyOpts(fetchDraft, locale));
  } catch (error) {
    console.error(`[DynamicPage] Error loading story "${slug}":`, {
      error: error instanceof Error ? error.message : String(error),
      slug,
      fetchDraft,
    });
    throw error;
  }

  if (!story) {
    return notFound();
  }

  if (livePreview) {
    return (
      <>
        <LocaleSync lang={locale} />
        <StoryblokLive story={story} />
      </>
    );
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
      url: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${localizedPath(locale, slug)}`,
      datePublished: story.first_published_at,
      dateModified: story.published_at,
      author,
      inLanguage: schemaLanguage(locale, site.language),
    });

    [adjacent, related] = await Promise.all([
      flags.prevNextWorkEnabled ? getAdjacentWork(story.slug) : Promise.resolve({}),
      flags.relatedWorkEnabled ? getRelatedWork(`/${slug}`) : Promise.resolve(related),
    ]);
  }

  const pageTheme = story.content?.isDark ? "dark" : "light";
  const showLanguagePicker = LOCALIZED_SLUGS.has(slug);

  return (
    <>
      <ThemeSync theme={pageTheme} />
      <LocaleSync lang={locale} />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
      {showLanguagePicker && (
        <Box
          css={{
            display: "flex",
            justifyContent: "flex-end",
            w: "full",
            maxW: "768px",
            mx: "auto",
            px: { base: "4", md: "6", lg: "8" },
            pt: { base: "8", md: "10" },
          }}
        >
          <LanguagePicker locale={locale} slug={slug} />
        </Box>
      )}
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
