import { type CropInput, cropRect, formatRatio, isCropped } from "./crop";

export interface ComposerMedia {
  key: string;
  /** `_uid` of the blok when the post already has this file. */
  uid?: string;
  /** The picked file when it still has to go up. */
  file?: File;
  previewUrl: string;
  kind: "image" | "video";
  width?: number;
  height?: number;
  fit: "cover" | "contain";
  alt: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type MediaAction =
  | { type: "reset"; items: ComposerMedia[] }
  | { type: "add"; items: ComposerMedia[] }
  | { type: "remove"; key: string }
  | { type: "move"; from: number; to: number }
  | { type: "update"; key: string; patch: Partial<ComposerMedia> };

export const MAX_MEDIA = 20;

const VIDEO_FILE = /\.(mp4|m4v|mov|webm)$/i;
const MEDIA_FILE = /\.(jpe?g|png|webp|gif|avif|mp4|m4v|mov|webm)$/i;

export function mediaReducer(state: ComposerMedia[], action: MediaAction): ComposerMedia[] {
  switch (action.type) {
    case "reset":
      return action.items;
    case "add":
      return [...state, ...action.items].slice(0, MAX_MEDIA);
    case "remove":
      return state.filter((item) => item.key !== action.key);
    case "move": {
      if (
        action.from === action.to ||
        !state[action.from] ||
        action.to < 0 ||
        action.to >= state.length
      ) {
        return state;
      }
      const next = [...state];
      const [moved] = next.splice(action.from, 1);
      next.splice(action.to, 0, moved as ComposerMedia);
      return next;
    }
    case "update":
      return state.map((item) => (item.key === action.key ? { ...item, ...action.patch } : item));
  }
}

export function isMediaFile(file: Pick<File, "name" | "type">): boolean {
  return /^(image|video)\//.test(file.type) || MEDIA_FILE.test(file.name);
}

export function isVideoFile(file: Pick<File, "name" | "type">): boolean {
  return file.type.startsWith("video/") || VIDEO_FILE.test(file.name);
}

export function newMedia(file: File, key: string, previewUrl: string): ComposerMedia {
  return {
    key,
    file,
    previewUrl,
    kind: isVideoFile(file) ? "video" : "image",
    fit: "cover",
    alt: "",
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

export function existingMedia(image: {
  uid: string;
  src: string;
  fit: "cover" | "contain";
  alt: string;
}): ComposerMedia {
  return {
    key: image.uid,
    uid: image.uid,
    previewUrl: image.src,
    kind: VIDEO_FILE.test(image.src) ? "video" : "image",
    fit: image.fit,
    alt: image.alt,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

/** The crop a new picture gets baked in: only where a frame crops it and it was moved or zoomed. */
export function mediaCrop(
  media: ComposerMedia,
  format: string,
  first?: ComposerMedia,
): CropInput | null {
  if (!canCrop(media, format)) {
    return null;
  }
  const input: CropInput = {
    width: media.width as number,
    height: media.height as number,
    ratio: formatRatio(format, first),
    zoom: media.zoom,
    offsetX: media.offsetX,
    offsetY: media.offsetY,
  };
  return isCropped(input) ? input : null;
}

/** A picture can be moved in its frame while it is new, fills the frame and the frame has a fixed shape. */
export function canCrop(media: ComposerMedia, format: string): boolean {
  return Boolean(
    media.file &&
    media.kind === "image" &&
    media.fit === "cover" &&
    format !== "original" &&
    media.width &&
    media.height &&
    media.file.type !== "image/gif",
  );
}

export function bakedRect(media: ComposerMedia, format: string, first?: ComposerMedia) {
  const crop = mediaCrop(media, format, first);
  return crop ? cropRect(crop) : undefined;
}
