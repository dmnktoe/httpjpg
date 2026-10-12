import { env } from "@httpjpg/env";
import { imagePreset, workTagLabels } from "@httpjpg/storyblok-utils";
import { Box } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, unstable_rethrow } from "next/navigation";
import type { Thing } from "schema-dts";

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
import { getAdjacentWork, readPageStory } from "@/lib/queries/work";
import { collectSchemaMedia } from "@/lib/schema-media";
import {
  generateBreadcrumbSchema,
  generateCreativeWorkSchema,
  generateProfilePageSchema,
  JsonLd,
  schemaIds,
  toGraph,
} from "@/lib/schema-org";
import { extractStoryMetadata, feedAlternates, toNextMetadata } from "@/lib/seo";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const IS_DEV = process.env.NODE_ENV === "development";

function storyOpts(draft: boolean, locale: AppLocale) {
  const language = storyblokLanguageParam(locale);
  return language ? { draft, language } : { draft };
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

/** Blocking, like the root layout; draft reads wait for request time. */
export const instant = false;

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug, fetchDraft } = await resolvePageRequest(params, searchParams);

  if (isInternalSlug(slug)) {
    return { title: "Not Found" };
  }

  const story = await readPageStory(slug, storyOpts(fetchDraft, locale));
  if (!story) {
    return { title: "Not Found" };
  }

  const [site, flags] = await Promise.all([getSiteConfig(), getFeatureFlags()]);
  const path = canonicalPath(locale, slug);
  const languages = localeAlternates(slug);
  const metadata = toNextMetadata(extractStoryMetadata(story), path, site.name, {
    ...feedAlternates(flags.rssFeedEnabled),
    ...(languages ? { languages } : {}),
  });
  if (!languages) {
    return metadata;
  }
  return {
    ...metadata,
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
    story = await readPageStory(slug, storyOpts(fetchDraft, locale));
  } catch (error) {
    unstable_rethrow(error);
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

  let adjacent: Awaited<ReturnType<typeof getAdjacentWork>> = {};
  let related: Awaited<ReturnType<typeof getRelatedWork>> = { tags: [], related: [] };

  const schemaMarkup = await buildPageSchema(story, locale, slug, isWorkPage);

  if (isWorkPage) {
    [adjacent, related] = await Promise.all([
      flags.prevNextWorkEnabled ? getAdjacentWork(story.slug) : Promise.resolve({}),
      flags.relatedWorkEnabled ? getRelatedWork(`/${slug}`) : Promise.resolve(related),
    ]);
  }

  const pageTheme = story.content?.isDark ? "dark" : "light";
  const pageAccent =
    isWorkPage && typeof story.content?.accentColor === "string" ? story.content.accentColor : null;
  const showLanguagePicker = LOCALIZED_SLUGS.has(slug);

  return (
    <>
      <ThemeSync theme={pageTheme} accent={pageAccent} />
      <LocaleSync lang={locale} />
      <JsonLd data={schemaMarkup} />
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
        <WorkNav prev={adjacent.prev} next={adjacent.next} accent={pageAccent} />
      )}
    </>
  );
}

/** `/home` renders the start page too; point it at the root so only one is indexed. */
function canonicalPath(locale: AppLocale, slug: string): string {
  return slug === STORYBLOK_SLUGS.HOME ? "/" : localizedPath(locale, slug);
}

interface SchemaStory {
  name: string;
  slug: string;
  first_published_at?: string | null;
  published_at?: string | null;
  content?: Record<string, unknown> & {
    component?: string;
    tags?: string[];
    images?: Array<{ filename: string; focus?: string }>;
  };
}

/** Breadcrumbs for every page, plus the node that says what the page is. */
async function buildPageSchema(
  story: SchemaStory,
  locale: AppLocale,
  slug: string,
  isWorkPage: boolean,
) {
  const [site, siteAuthor] = await Promise.all([getSiteConfig(), getAuthor()]);
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const ids = schemaIds(base);
  const url = `${base}${canonicalPath(locale, slug)}`;
  const meta = extractStoryMetadata(story);
  const inLanguage = schemaLanguage(locale, site.language);
  const isPartOf = site.name ? { "@id": ids.website } : undefined;
  const datePublished = story.first_published_at || undefined;
  const dateModified = story.published_at || undefined;

  const nodes: Thing[] = [
    generateBreadcrumbSchema([
      { name: site.name || "Home", url: `${base}/` },
      ...(slug === STORYBLOK_SLUGS.HOME ? [] : [{ name: meta.title, url }]),
    ]),
  ];

  if (isWorkPage) {
    const images = story.content?.images?.map((img) => imagePreset.og(img.filename, img.focus));
    const media = collectSchemaMedia(story.content, {
      name: meta.title,
      description: meta.description || undefined,
      uploadDate: datePublished,
    });
    const author = siteAuthor
      ? { ...siteAuthor, id: ids.person, sameAs: await getSocialProfiles() }
      : undefined;
    nodes.unshift(
      generateCreativeWorkSchema({
        name: meta.title,
        description: meta.description || undefined,
        image: images?.[0] || images,
        url,
        datePublished,
        dateModified,
        author,
        inLanguage,
        isPartOf,
        keywords: workTagLabels(story.content?.tags),
        video: media.videos,
        audio: media.recordings,
        associatedMedia: media.images,
      }),
    );
  } else if (slug === STORYBLOK_SLUGS.CV && siteAuthor) {
    nodes.unshift(
      generateProfilePageSchema({
        url,
        name: meta.title,
        personId: ids.person,
        dateCreated: datePublished,
        dateModified,
        inLanguage,
        isPartOf,
      }),
    );
  }

  return toGraph(nodes);
}
