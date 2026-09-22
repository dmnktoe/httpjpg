import {
  CMS_OPTIONS,
  getResponsiveImage,
  isVideoAsset,
  type SbWorkData,
} from "@httpjpg/storyblok-utils";
import type { FloatingMediaItem } from "@httpjpg/ui";

const DEFAULT_FRAME_WIDTH = 400;

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

function parseFrameWidth(value?: string): number {
  if (value && (CMS_OPTIONS.floatingMediaWidth as readonly string[]).includes(value)) {
    return Number.parseInt(value, 10);
  }
  return DEFAULT_FRAME_WIDTH;
}

function sizesAttr(width: number): string {
  return `(max-width: ${width + 16}px) calc(100vw - 16px), ${width}px`;
}

/** Map the work page's floating_media bloks onto the overlay items. */
export function workFloatingMedia(blok: SbWorkData): FloatingMediaItem[] {
  return (blok.floating_media ?? []).flatMap((item): FloatingMediaItem[] => {
    const name = item.name?.trim() ?? "";
    const filename = item.file?.filename?.trim() ?? "";
    const url = item.url?.trim() ?? "";
    const src = filename || url;
    if (!name || !src) {
      return [];
    }

    const width = parseFrameWidth(item.width);
    const mediaWidth = toDimension(item.file?.width);
    const mediaHeight = toDimension(item.file?.height);
    const alt = item.file?.alt?.trim() || name;

    if (item.file && filename && !isVideoAsset(item.file)) {
      const image = getResponsiveImage(filename, {
        focus: item.file.focus,
        widths: [width, width * 2, Math.min(width * 3, 1920)],
      });
      return [
        {
          id: item._uid,
          name,
          src: image.src,
          srcSet: image.srcSet || undefined,
          sizes: sizesAttr(width),
          width,
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
        width,
        kind: item.file && isVideoAsset(item.file) ? "video" : undefined,
        alt,
        mediaWidth,
        mediaHeight,
      },
    ];
  });
}
