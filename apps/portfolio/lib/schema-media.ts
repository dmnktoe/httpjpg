import { extractPlainText, isVideoAsset, type StoryblokRichText } from "@httpjpg/storyblok-utils";
import type { ImageObject, MusicRecording, VideoObject } from "schema-dts";

const MAX_DEPTH = 8;

const MAX_IMAGES = 12;
const MAX_VIDEOS = 6;
const MAX_RECORDINGS = 12;

interface AssetLike {
  filename?: string;
  alt?: string;
  title?: string;
  copyright?: string;
  content_type?: string;
}

interface BlokLike extends Record<string, unknown> {
  component: string;
}

interface SchemaMediaContext {
  name: string;
  description?: string;
  /** Videos are dropped without it (required by Google). */
  uploadDate?: string;
}

interface SchemaMedia {
  images: ImageObject[];
  videos: VideoObject[];
  recordings: MusicRecording[];
}

/** schema.org media nodes for a story; `collectStoryMedia` builds palette thumbnails instead. */
export function collectSchemaMedia(content: unknown, context: SchemaMediaContext): SchemaMedia {
  const media: SchemaMedia = { images: [], videos: [], recordings: [] };
  const seen = new Set<string>();

  const addImage = (asset: unknown, label?: string) => {
    if (!isAsset(asset) || !asset.filename || isVideoAsset(asset)) {
      return;
    }
    if (seen.has(asset.filename) || media.images.length >= MAX_IMAGES) {
      return;
    }
    seen.add(asset.filename);
    media.images.push(toImageObject(asset, label));
  };

  const visit = (blok: BlokLike) => {
    switch (blok.component) {
      case "image":
      case "scroll_clip_image":
        addImage(blok.image, text(blok.alt) || captionText(blok.caption));
        return;
      case "image_comparison":
        addImage(blok.before, text(blok.beforeAlt) || text(blok.beforeLabel));
        addImage(blok.after, text(blok.afterAlt) || text(blok.afterLabel));
        return;
      case "slideshow":
        if (Array.isArray(blok.images)) {
          for (const asset of blok.images) {
            addImage(asset);
          }
        }
        return;
      case "video": {
        const video = toVideoObject(blok, context);
        if (video && media.videos.length < MAX_VIDEOS) {
          media.videos.push(video);
        }
        return;
      }
      case "music_player": {
        const recording = toMusicRecording(blok);
        if (recording && media.recordings.length < MAX_RECORDINGS) {
          media.recordings.push(recording);
        }
        return;
      }
      default:
        return;
    }
  };

  const featured = (content as { images?: unknown } | null | undefined)?.images;
  if (Array.isArray(featured)) {
    for (const asset of featured) {
      addImage(asset);
    }
  }

  const walk = (node: unknown, depth: number): void => {
    if (depth > MAX_DEPTH || node === null || typeof node !== "object") {
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, depth + 1);
      }
      return;
    }
    if (isBlok(node)) {
      visit(node);
    }
    for (const value of Object.values(node as Record<string, unknown>)) {
      walk(value, depth + 1);
    }
  };

  walk(content, 0);

  return media;
}

function toImageObject(asset: AssetLike, label?: string): ImageObject {
  const copyright = text(asset.copyright);
  const caption = label || text(asset.alt) || text(asset.title);
  return {
    "@type": "ImageObject",
    contentUrl: asset.filename,
    ...(caption ? { caption } : {}),
    ...(copyright ? { creditText: copyright, copyrightNotice: copyright } : {}),
  };
}

function toVideoObject(blok: BlokLike, context: SchemaMediaContext): VideoObject | null {
  const poster = isAsset(blok.poster) ? blok.poster.filename : undefined;
  if (!poster || !context.uploadDate) {
    return null;
  }

  const source = text(blok.source) || "native";
  const url = text(blok.videoUrl);
  const file = isAsset(blok.video) ? blok.video.filename : undefined;
  const location =
    source === "youtube" || source === "vimeo"
      ? url
        ? { embedUrl: url }
        : null
      : file || url
        ? { contentUrl: file || url }
        : null;
  if (!location) {
    return null;
  }

  const caption = captionText(blok.caption);
  return {
    "@type": "VideoObject",
    name: caption || context.name,
    description: caption || context.description || context.name,
    thumbnailUrl: poster,
    uploadDate: context.uploadDate,
    ...location,
  };
}

function toMusicRecording(blok: BlokLike): MusicRecording | null {
  const name = text(blok.title);
  const src = text(blok.src);
  if (!name || !src) {
    return null;
  }
  const artist = text(blok.artist);
  const artwork = text(blok.artwork);
  const isFile = text(blok.source) === "mp3";
  return {
    "@type": "MusicRecording",
    name,
    ...(artist ? { byArtist: { "@type": "MusicGroup", name: artist } } : {}),
    ...(artwork ? { image: artwork } : {}),
    ...(isFile
      ? { audio: { "@type": "AudioObject", contentUrl: src, encodingFormat: "audio/mpeg" } }
      : { url: src }),
  };
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

function isRichTextDoc(value: unknown): value is StoryblokRichText {
  return typeof value === "object" && value !== null && (value as { type?: string }).type === "doc";
}

function captionText(value: unknown): string {
  return isRichTextDoc(value) ? extractPlainText(value).trim() : "";
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
