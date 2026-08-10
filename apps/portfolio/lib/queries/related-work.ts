import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { workTagLabels } from "@httpjpg/storyblok-utils";

import { relatedDocuments } from "../search/related";
import { getSearchIndex } from "./search-index";

export interface RelatedWorkItem {
  id: string;
  title: string;
  href: string;
  date?: string;
  thumb?: string;
  /** Labels of the tags this story shares with the one being viewed. */
  sharedTags: string[];
}

export interface RelatedWork {
  /** The viewed story's own tags, as labels. */
  tags: string[];
  related: RelatedWorkItem[];
}

const EMPTY: RelatedWork = { tags: [], related: [] };

/**
 * Tags and nearest neighbours for one story, off the search index both search
 * and ask already read — no second corpus, no extra Storyblok roundtrip.
 *
 * Never throws: `getSearchIndex` deliberately rejects rather than caching an
 * outage, and a recommendation strip is not worth 500-ing a work page over.
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
        thumb: document.media?.find((item) => item.kind === "image" && item.thumb)?.thumb,
        sharedTags: workTagLabels(document.sharedTags),
      })),
    };
  } catch (error) {
    console.error("Related work lookup failed:", error);
    captureServerException(error, { tags: { query: "related-work" } });
    return EMPTY;
  }
}
