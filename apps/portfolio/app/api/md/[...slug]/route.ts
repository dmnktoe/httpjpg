import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { fetchStory } from "@httpjpg/storyblok-next";
import { resolveWorkTags, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";

import { storyContentToMarkdown } from "@/lib/markdown/story-markdown";
import { isInternalSlug } from "@/lib/page-theme";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

/**
 * The Markdown representation of a page, reached at `<path>.md` through a
 * rewrite in `next.config.ts`.
 *
 * Published content only. Draft mode deliberately does not apply: this is the
 * machine-readable mirror of the public site, and a preview cookie leaking
 * unpublished work into a plain-text endpoint is not a trade worth making.
 */

interface RouteContext {
  params: Promise<{ slug?: string[] }>;
}

interface MarkdownStory {
  name: string;
  slug: string;
  full_slug?: string;
  published_at?: string | null;
  first_published_at?: string | null;
  content?: {
    component?: string;
    title?: string;
    date?: string;
    tags?: string[];
    description?: unknown;
  } & Record<string, unknown>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const fullSlug = (slug ?? []).join("/");

  if (!fullSlug || isInternalSlug(fullSlug) || fullSlug === STORYBLOK_SLUGS.CONFIG) {
    return notFound();
  }

  let story: MarkdownStory | null;
  try {
    story = (await fetchStory(fullSlug, {
      draftMode: false,
      resolveRelations: [STORYBLOK_RELATIONS.WORK_LIST],
    })) as MarkdownStory | null;
  } catch (error) {
    console.error(`Markdown mirror failed for "${fullSlug}":`, error);
    captureServerException(error, { tags: { route: "md" } });
    return new Response("Upstream error\n", { status: 502, headers: textHeaders(0) });
  }

  if (!story) {
    return notFound();
  }

  return new Response(renderDocument(story, fullSlug), {
    headers: textHeaders(3600),
  });
}

function renderDocument(story: MarkdownStory, fullSlug: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const canonical = `${base}/${fullSlug === STORYBLOK_SLUGS.HOME ? "" : fullSlug}`;
  const title = story.content?.title || story.name;

  const front: string[] = [`# ${title}`, "", `> Source: ${canonical}`];

  const date = story.content?.date || story.first_published_at;
  if (date) {
    front.push(`> Date: ${date.slice(0, 10)}`);
  }

  const tags = resolveWorkTags(story.content?.tags);
  if (tags.length > 0) {
    front.push(`> Tags: ${tags.map((tag) => tag.label).join(", ")}`);
  }

  const body = storyContentToMarkdown(story.content);

  return `${[...front, "", body].join("\n").trimEnd()}\n`;
}

function notFound(): Response {
  return new Response("Not found\n", { status: 404, headers: textHeaders(0) });
}

function textHeaders(maxAge: number): Record<string, string> {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": maxAge
      ? `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
      : "no-store",
  };
}
