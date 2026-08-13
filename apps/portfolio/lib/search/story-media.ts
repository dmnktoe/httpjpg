import { extractPlainText, imagePreset, isVideoAsset } from "@httpjpg/storyblok-utils";

import type { SearchMedia } from "./ranking";

/** Bounds the walk so a cyclic payload cannot hang a build. */
const MAX_DEPTH = 8;

/** A strip, not a gallery — the palette shows a handful per story at most. */
const MAX_MEDIA_PER_STORY = 6;

interface AssetLike {
  filename?: string;
  alt?: string;
  title?: string;
  focus?: string;
  content_type?: string;
}

interface BlokLike extends Record<string, unknown> {
  component: string;
  _uid?: string;
}

function isBlok(value: unknown): value is BlokLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { component?: unknown }).component === "string"
  );
}

function isAsset(value: unknown): value is AssetLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { filename?: unknown }).filename === "string"
  );
}

function captionText(value: unknown): string {
  if (typeof value === "object" && value !== null && (value as { type?: string }).type === "doc") {
    return extractPlainText(value as { content?: [] });
  }
  return "";
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** `"title — artist"`, skipping either half when the editor left it empty. */
function trackLabel(blok: BlokLike): string {
  return [text(blok.title), text(blok.artist)].filter(Boolean).join(" — ");
}

function imageFromAsset(asset: AssetLike, id: string, label: string): SearchMedia | null {
  if (!asset.filename || isVideoAsset(asset)) {
    return null;
  }
  return {
    id,
    kind: "image",
    thumb: imagePreset.thumb(asset.filename, asset.focus),
    source: asset.filename,
    focus: asset.focus,
    label: label || asset.alt || asset.title || "",
  };
}

function collectFromBlok(blok: BlokLike): SearchMedia[] {
  const uid = text(blok._uid) || blok.component;

  switch (blok.component) {
    case "image":
    case "scroll_clip_image": {
      if (!isAsset(blok.image)) {
        return [];
      }
      const label = text(blok.alt) || captionText(blok.caption);
      const media = imageFromAsset(blok.image, uid, label);
      return media ? [media] : [];
    }
    case "video": {
      if (!isAsset(blok.poster) || !blok.poster.filename) {
        return [];
      }
      return [
        {
          id: uid,
          kind: "video",
          thumb: imagePreset.thumb(blok.poster.filename, blok.poster.focus),
          source: blok.poster.filename,
          focus: blok.poster.focus,
          label: captionText(blok.caption) || text(blok.poster.alt),
        },
      ];
    }
    case "slideshow": {
      if (!Array.isArray(blok.images)) {
        return [];
      }
      return blok.images
        .map((asset, index) =>
          isAsset(asset) ? imageFromAsset(asset, `${uid}-${index}`, text(asset.alt)) : null,
        )
        .filter((media): media is SearchMedia => media !== null);
    }
    case "music_player": {
      const artwork = text(blok.artwork);
      return [
        {
          id: uid,
          kind: "audio",
          // Tracks without artwork still belong in the strip — the palette
          // draws a glyph tile for them rather than dropping the track.
          thumb: artwork ? imagePreset.thumb(artwork) : "",
          source: artwork || undefined,
          label: trackLabel(blok),
        },
      ];
    }
    default:
      return [];
  }
}

/** Pull the thumbnails a story shows into the palette's media strip. */
export function collectStoryMedia(content: unknown, limit = MAX_MEDIA_PER_STORY): SearchMedia[] {
  const collected: SearchMedia[] = [];
  const seen = new Set<string>();

  const walk = (node: unknown, depth: number): void => {
    if (depth > MAX_DEPTH || node === null || node === undefined || collected.length >= limit) {
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, depth + 1);
      }
      return;
    }
    if (typeof node !== "object") {
      return;
    }

    if (isBlok(node)) {
      for (const media of collectFromBlok(node)) {
        // A page repeating one asset should not spend the whole strip on it.
        const key = media.thumb || `${media.kind}:${media.label}`;
        if (seen.has(key) || collected.length >= limit) {
          continue;
        }
        seen.add(key);
        collected.push(media);
      }
    }

    for (const value of Object.values(node as Record<string, unknown>)) {
      walk(value, depth + 1);
    }
  };

  walk(content, 0);

  return collected;
}
