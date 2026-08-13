import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getResponsiveImage, workTagLabels } from "@httpjpg/storyblok-utils";

import type { SearchMedia } from "../search/ranking";
import { relatedDocuments } from "../search/related";
import { getSearchIndex } from "./search-index";

/** The crop the cards are laid out at, so the box and the cut file cannot drift. */
export const RELATED_CARD_ASPECT_RATIO = "4/3";

const CARD_WIDTHS = [320, 480, 640, 960, 1280];

export interface RelatedWorkItem {
  id: string;
  title: string;
  href: string;
  date?: string;
  thumb?: string;
  thumbSrcSet?: string;
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
        ...cardImage(
          document.media?.find((item) => item.kind === "image" && (item.source || item.thumb)),
        ),
        sharedTags: workTagLabels(document.sharedTags),
      })),
    };
  } catch (error) {
    console.error("Related work lookup failed:", error);
    captureServerException(error, { tags: { query: "related-work" } });
    return EMPTY;
  }
}

/** A document indexed before `source` existed falls back to its 200px thumbnail. */
function cardImage(media: SearchMedia | undefined): Pick<RelatedWorkItem, "thumb" | "thumbSrcSet"> {
  if (!media) {
    return {};
  }
  if (!media.source) {
    return { thumb: media.thumb };
  }

  const { src, srcSet } = getResponsiveImage(media.source, {
    widths: CARD_WIDTHS,
    aspectRatio: RELATED_CARD_ASPECT_RATIO,
    focus: media.focus,
  });

  return { thumb: src, thumbSrcSet: srcSet || undefined };
}
