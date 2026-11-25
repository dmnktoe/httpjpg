import { getResponsiveImage } from "@httpjpg/storyblok-utils";
import type { FeedPanelItem } from "@httpjpg/ui";

import type { FeedPostEntry } from "../queries/feed";

/** Posts the panel cycles through. */
export const FEED_PANEL_SIZE = 8;

// The panel is 224px wide when it floats and as wide as a phone when it does not.
const PANEL_WIDTHS = [320, 640, 960];

/** One image per post — its cover, or a track's artwork. Posts without either are skipped. */
export function toFeedPanelItems(posts: FeedPostEntry[]): FeedPanelItem[] {
  const items: FeedPanelItem[] = [];
  for (const post of posts) {
    const item = toPanelItem(post);
    if (item) {
      items.push(item);
    }
    if (items.length === FEED_PANEL_SIZE) {
      break;
    }
  }
  return items;
}

function toPanelItem(post: FeedPostEntry): FeedPanelItem | null {
  const cover = post.content.images?.find((image) => Boolean(image.image?.filename));
  if (cover) {
    const { src, srcSet } = getResponsiveImage(cover.image.filename, {
      widths: PANEL_WIDTHS,
      focus: cover.image.focus || "",
    });
    return {
      id: post.id,
      src,
      ...(srcSet ? { srcSet } : {}),
      alt: cover.alt || cover.image.alt || post.content.caption?.trim() || "",
      fit: cover.fit === "contain" ? "contain" : "cover",
    };
  }
  const track = post.content.music?.[0];
  if (track?.artwork) {
    return {
      id: post.id,
      src: track.artwork,
      alt: [track.title, track.artist].filter(Boolean).join(" — "),
      fit: "cover",
    };
  }
  return null;
}
