import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getResponsiveImage, workTagLabels } from "@httpjpg/storyblok-utils";

import type { SearchDocument } from "../search/ranking";
import { relatedDocuments } from "../search/related";
import { getSearchIndex } from "./search-index";

/** The crop the cards are laid out at, so the box and the cut file cannot drift. */
export const RELATED_CARD_ASPECT_RATIO = "4/3";

/** The crop the list thumbs are laid out at, so the box and the cut file cannot drift. */
export const RELATED_LIST_ASPECT_RATIO = "1/1";

const CARD_WIDTHS = [320, 480, 640, 960, 1280];
const LIST_WIDTHS = [40, 80, 120];

export interface RelatedWorkItem {
  id: string;
  title: string;
  href: string;
  date?: string;
  thumb?: string;
  thumbSrcSet?: string;
  square?: string;
  squareSrcSet?: string;
  sharedTags: string[];
}

export interface RelatedWork {
  tags: string[];
  related: RelatedWorkItem[];
}

const EMPTY: RelatedWork = { tags: [], related: [] };

/**
 * Reads the same index search and ask read, so a story cannot be findable by a
 * tag and unrelated to its neighbours by the same tag.
 */
export async function getRelatedWork(href: string, limit = 3): Promise<RelatedWork> {
  try {
    const documents = await getSearchIndex();
    const current = documents.find((document) => document.href === href);
    if (!current) {
      return EMPTY;
    }

    return {
      tags: workTagLabels(current.tagValues),
      related: relatedDocuments(documents, current, limit).map((document) => ({
        id: document.id,
        title: document.title,
        href: document.href,
        date: document.date,
        ...relatedImages(pickRelatedImage(document)),
        sharedTags: workTagLabels(document.sharedTags),
      })),
    };
  } catch (error) {
    console.error("Related work lookup failed:", error);
    captureServerException(error, { tags: { query: "related-work" } });
    return EMPTY;
  }
}

interface RelatedImageSource {
  source?: string;
  thumb?: string;
  focus?: string;
}

/**
 * Featured image first — the same asset the nav hover preview uses. A document
 * indexed before `featured` existed falls back to its first body image.
 */
function pickRelatedImage(document: SearchDocument): RelatedImageSource | undefined {
  if (document.featured?.source) {
    return document.featured;
  }
  return document.media?.find((item) => item.kind === "image" && (item.source || item.thumb));
}

/** A document indexed before `source` existed falls back to its 200px thumbnail. */
function relatedImages(
  media: RelatedImageSource | undefined,
): Pick<RelatedWorkItem, "thumb" | "thumbSrcSet" | "square" | "squareSrcSet"> {
  if (!media) {
    return {};
  }
  if (!media.source) {
    return media.thumb ? { thumb: media.thumb, square: media.thumb } : {};
  }

  const card = getResponsiveImage(media.source, {
    widths: CARD_WIDTHS,
    aspectRatio: RELATED_CARD_ASPECT_RATIO,
    focus: media.focus,
  });
  const square = getResponsiveImage(media.source, {
    widths: LIST_WIDTHS,
    aspectRatio: RELATED_LIST_ASPECT_RATIO,
    focus: media.focus,
  });

  return {
    thumb: card.src,
    thumbSrcSet: card.srcSet || undefined,
    square: square.src,
    squareSrcSet: square.srcSet || undefined,
  };
}
