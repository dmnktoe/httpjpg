import { getResponsiveImage, isVideoAsset, type SbPostImageData } from "@httpjpg/storyblok-utils";
import type { FeedPanelImage, FeedPanelItem } from "@httpjpg/ui";

import type { FeedPostEntry } from "../queries/feed";

export const FEED_PANEL_SIZE = 8;

export const FEED_PANEL_IMAGES = 5;

const PANEL_WIDTHS = [320, 640, 960];

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
  const caption = post.content.caption?.trim().split("\n")[0]?.trim() || undefined;
  const images = (post.content.images ?? [])
    .filter((image) => Boolean(image.image?.filename) && !isVideoAsset(image.image))
    .slice(0, FEED_PANEL_IMAGES)
    .map((image) => toPanelImage(image, caption));
  if (images.length) {
    return { id: post.id, images, ...(caption ? { caption } : {}) };
  }
  const track = post.content.music?.[0];
  if (track?.artwork) {
    const label = [track.title, track.artist].filter(Boolean).join(" — ");
    return {
      id: post.id,
      images: [{ id: track._uid, src: track.artwork, alt: label, fit: "cover" }],
      ...(caption || label ? { caption: caption || label } : {}),
    };
  }
  return null;
}

function toPanelImage(image: SbPostImageData, caption: string | undefined): FeedPanelImage {
  const { src, srcSet } = getResponsiveImage(image.image.filename, {
    widths: PANEL_WIDTHS,
    focus: image.image.focus || "",
  });
  return {
    id: image._uid,
    src,
    ...(srcSet ? { srcSet } : {}),
    alt: image.alt || image.image.alt || caption || "",
    fit: image.fit === "contain" ? "contain" : "cover",
  };
}
