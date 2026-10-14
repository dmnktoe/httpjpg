import {
  CMS_OPTIONS,
  getResponsiveImage,
  isVideoAsset,
  type SbWorkData,
} from "@httpjpg/storyblok-utils";
import { DESKTOP_MEDIA_WIDTH, type DesktopMediaItem, desktopMediaSizesAttr } from "@httpjpg/ui";

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
  if (value && (CMS_OPTIONS.desktopMediaWidth as readonly string[]).includes(value)) {
    return Number.parseInt(value, 10);
  }
  return DESKTOP_MEDIA_WIDTH;
}

/** Map the work page's desktop_media bloks onto the overlay items. */
export function workDesktopMedia(blok: SbWorkData): DesktopMediaItem[] {
  return (blok.desktop_media ?? []).flatMap((item): DesktopMediaItem[] => {
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
          sizes: desktopMediaSizesAttr(width),
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
