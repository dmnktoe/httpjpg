import { getResponsiveImage } from "./image-processing";

interface ImageLike {
  filename?: string;
  alt?: string;
  title?: string;
  copyright?: string;
  source?: string;
  focus?: string;
  content_type?: string;
}

interface SlideshowImageLike {
  url: string;
  alt: string;
  copyright?: string;
  copyrightSource?: string;
  focus?: string;
  videoUrl?: string;
  srcSet?: string;
}

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;

/** Heuristic check: is this Storyblok asset a video? */
export function isVideoAsset(asset: Pick<ImageLike, "filename" | "content_type">): boolean {
  return Boolean(asset.content_type?.startsWith("video/") || VIDEO_EXT.test(asset.filename || ""));
}

export function toSlideshowImage(asset: ImageLike, fallbackAlt: string): SlideshowImageLike {
  const isVideo = isVideoAsset(asset);
  if (isVideo) {
    return {
      url: "",
      alt: asset.alt || asset.title || fallbackAlt,
      copyright: asset.copyright,
      copyrightSource: asset.source,
      focus: asset.focus,
      videoUrl: asset.filename,
    };
  }
  const { src, srcSet } = getResponsiveImage(asset.filename || "", { focus: asset.focus });
  return {
    url: src,
    alt: asset.alt || asset.title || fallbackAlt,
    copyright: asset.copyright,
    copyrightSource: asset.source,
    focus: asset.focus,
    srcSet: srcSet || undefined,
  };
}

/** First non-video asset, or undefined. */
export function firstImage<T extends Pick<ImageLike, "filename" | "content_type">>(
  assets: ReadonlyArray<T> | undefined,
): T | undefined {
  if (!assets?.length) {
    return undefined;
  }
  return assets.find((asset) => Boolean(asset.filename) && !isVideoAsset(asset));
}

/** First non-video filename, or undefined. */
export function firstImageFilename(
  assets: ReadonlyArray<Pick<ImageLike, "filename" | "content_type">> | undefined,
): string | undefined {
  return firstImage(assets)?.filename;
}
