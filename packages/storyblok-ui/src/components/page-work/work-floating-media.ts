import { getResponsiveImage, isVideoAsset, type SbWorkData } from "@httpjpg/storyblok-utils";
import type { FloatingMediaItem } from "@httpjpg/ui";

const FLOATING_MEDIA_SIZES = "(max-width: 416px) calc(100vw - 16px), 400px";

function toDimension(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
}

/** Map the work page's floating_media bloks onto the overlay items. */
export function workFloatingMedia(blok: SbWorkData): FloatingMediaItem[] {
  return (blok.floating_media ?? []).flatMap((item) => {
    const name = item.name?.trim() ?? "";
    const filename = item.file?.filename?.trim() ?? "";
    const url = item.url?.trim() ?? "";
    const src = filename || url;
    if (!name || !src) {
      return [];
    }

    const mediaWidth = toDimension(item.file?.width);
    const mediaHeight = toDimension(item.file?.height);
    const alt = item.file?.alt?.trim() || name;

    if (item.file && filename && !isVideoAsset(item.file)) {
      const image = getResponsiveImage(filename, {
        focus: item.file.focus,
        widths: [400, 800, 1200],
      });
      return [
        {
          id: item._uid,
          name,
          src: image.src,
          srcSet: image.srcSet || undefined,
          sizes: FLOATING_MEDIA_SIZES,
          kind: "image",
          alt,
          mediaWidth,
          mediaHeight,
        },
      ];
    }

    return [
      {
        id: item._uid,
        name,
        src,
        kind: item.file && isVideoAsset(item.file) ? "video" : undefined,
        alt,
        mediaWidth,
        mediaHeight,
      },
    ];
  });
}
