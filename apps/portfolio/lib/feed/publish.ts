import { createHash, randomBytes, randomUUID } from "node:crypto";

export const POST_FORMATS = ["1/1", "4/5", "original"] as const;
export type PostFormat = (typeof POST_FORMATS)[number];

const IMAGE_FITS = ["cover", "contain"] as const;
type ImageFit = (typeof IMAGE_FITS)[number];

const MUSIC_SOURCES = ["mp3", "spotify", "soundcloud"] as const;
type MusicSource = (typeof MUSIC_SOURCES)[number];

export const MAX_CAPTION_LENGTH = 2200;
export const MAX_IMAGES = 20;

const MAX_FILENAME_LENGTH = 120;
const MAX_DIMENSION = 20_000;
const MAX_TEXT_LENGTH = 200;
const CLIENT_ID = /^[A-Za-z0-9-]{8,64}$/;
const UPLOAD_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|mp3|m4a|wav)$/i;

export type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

export interface AssetRequest {
  filename: string;
  size?: string;
}

export interface PublishImage {
  assetId: number;
  fit: ImageFit;
  alt?: string;
}

export interface PublishMusic {
  source: MusicSource;
  src?: string;
  assetId?: number;
  title?: string;
  artist?: string;
  artworkAssetId?: number;
}

export interface PublishRequest {
  caption: string;
  format: PostFormat;
  images: PublishImage[];
  music?: PublishMusic;
  date?: Date;
  clientId?: string;
}

export function parseAssetRequest(body: unknown): Parsed<AssetRequest> {
  if (!isRecord(body)) {
    return fail("Expected a JSON object");
  }
  const filename = typeof body.filename === "string" ? sanitizeFilename(body.filename) : "";
  if (!filename || !UPLOAD_EXTENSIONS.test(filename)) {
    return fail("filename must end in jpg, png, webp, gif, avif, mp3, m4a or wav");
  }
  if (body.width === undefined && body.height === undefined) {
    return { ok: true, value: { filename } };
  }
  if (!isDimension(body.width) || !isDimension(body.height)) {
    return fail(`width and height must be integers between 1 and ${MAX_DIMENSION}`);
  }
  return { ok: true, value: { filename, size: `${body.width}x${body.height}` } };
}

export function parsePublishRequest(body: unknown): Parsed<PublishRequest> {
  if (!isRecord(body)) {
    return fail("Expected a JSON object");
  }

  const caption = body.caption === undefined ? "" : body.caption;
  if (typeof caption !== "string" || caption.length > MAX_CAPTION_LENGTH) {
    return fail(`caption must be a string of at most ${MAX_CAPTION_LENGTH} characters`);
  }

  const format = body.format === undefined ? "1/1" : body.format;
  if (!isOneOf(POST_FORMATS, format)) {
    return fail(`format must be one of ${POST_FORMATS.join(", ")}`);
  }

  const rawImages = body.images === undefined ? [] : body.images;
  if (!Array.isArray(rawImages) || rawImages.length > MAX_IMAGES) {
    return fail(`images must be an array of at most ${MAX_IMAGES} entries`);
  }
  const images: PublishImage[] = [];
  for (const raw of rawImages) {
    const image = parseImage(raw);
    if (!image.ok) {
      return image;
    }
    images.push(image.value);
  }

  let music: PublishMusic | undefined;
  if (body.music !== undefined && body.music !== null) {
    const parsed = parseMusic(body.music);
    if (!parsed.ok) {
      return parsed;
    }
    music = parsed.value;
  }

  if (!images.length && !music) {
    return fail("A post needs at least one image or a music entry");
  }

  let date: Date | undefined;
  if (body.date !== undefined) {
    date = typeof body.date === "string" ? new Date(body.date) : undefined;
    if (!date || Number.isNaN(date.getTime())) {
      return fail("date must be an ISO 8601 string");
    }
  }

  let clientId: string | undefined;
  if (body.clientId !== undefined) {
    if (typeof body.clientId !== "string" || !CLIENT_ID.test(body.clientId)) {
      return fail("clientId must be 8 to 64 letters, digits or hyphens");
    }
    clientId = body.clientId.toLowerCase();
  }

  return {
    ok: true,
    value: {
      caption: caption.trim(),
      format,
      images,
      ...(music ? { music } : {}),
      date,
      ...(clientId ? { clientId } : {}),
    },
  };
}

export function publishAssetIds(request: PublishRequest): number[] {
  const ids = request.images.map((image) => image.assetId);
  if (request.music?.assetId) {
    ids.push(request.music.assetId);
  }
  if (request.music?.artworkAssetId) {
    ids.push(request.music.artworkAssetId);
  }
  return [...new Set(ids)];
}

export function buildPostContent(
  request: PublishRequest,
  assets: ReadonlyMap<number, string>,
  date: Date,
): Record<string, unknown> {
  const music = request.music;
  return {
    component: "post",
    caption: request.caption,
    date: storyblokDate(date),
    format: request.format,
    images: request.images.map((image) => ({
      _uid: randomUUID(),
      component: "post_image",
      image: {
        id: image.assetId,
        filename: assets.get(image.assetId),
        fieldtype: "asset",
        alt: image.alt ?? "",
      },
      alt: image.alt ?? "",
      fit: image.fit,
    })),
    music: music
      ? [
          {
            _uid: randomUUID(),
            component: "music_player",
            source: music.source,
            src: music.assetId ? assets.get(music.assetId) : music.src,
            title: music.title ?? "",
            artist: music.artist ?? "",
            artwork: music.artworkAssetId ? assets.get(music.artworkAssetId) : "",
          },
        ]
      : [],
  };
}

export function postSlug(date: Date, clientId?: string): string {
  const stamp = date
    .toISOString()
    .replace(/\.\d+Z$/, "")
    .replace(/[-:]/g, "")
    .replace("T", "-");
  const suffix = clientId
    ? createHash("sha256").update(clientId).digest("hex").slice(0, 8)
    : randomBytes(2).toString("hex");
  return `${stamp}-${suffix}`;
}

export function postName(request: PublishRequest, date: Date): string {
  const firstLine = request.caption.split("\n")[0]?.trim() ?? "";
  return firstLine ? Array.from(firstLine).slice(0, 60).join("") : `Post ${storyblokDate(date)}`;
}

function storyblokDate(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function parseImage(raw: unknown): Parsed<PublishImage> {
  if (!isRecord(raw) || !isAssetId(raw.assetId)) {
    return fail("Each image needs the assetId of a signed upload");
  }
  const fit = raw.fit === undefined ? "cover" : raw.fit;
  if (!isOneOf(IMAGE_FITS, fit)) {
    return fail(`fit must be one of ${IMAGE_FITS.join(", ")}`);
  }
  const alt = optionalText(raw.alt);
  if (alt === null) {
    return fail(`alt must be a string of at most ${MAX_TEXT_LENGTH} characters`);
  }
  return { ok: true, value: { assetId: raw.assetId, fit, ...(alt ? { alt } : {}) } };
}

function parseMusic(raw: unknown): Parsed<PublishMusic> {
  if (!isRecord(raw) || !isOneOf(MUSIC_SOURCES, raw.source)) {
    return fail(`music.source must be one of ${MUSIC_SOURCES.join(", ")}`);
  }
  const hasAsset = raw.assetId !== undefined;
  if (hasAsset && (raw.source !== "mp3" || !isAssetId(raw.assetId))) {
    return fail("music.assetId is the signed upload of an mp3");
  }
  if (!hasAsset && !isHttpsUrl(raw.src)) {
    return fail("music.src must be an https URL");
  }
  if (raw.artworkAssetId !== undefined && !isAssetId(raw.artworkAssetId)) {
    return fail("music.artworkAssetId must be the assetId of a signed upload");
  }
  const title = optionalText(raw.title);
  const artist = optionalText(raw.artist);
  if (title === null || artist === null) {
    return fail(
      `music.title and music.artist are strings of at most ${MAX_TEXT_LENGTH} characters`,
    );
  }
  return {
    ok: true,
    value: {
      source: raw.source,
      ...(hasAsset ? { assetId: raw.assetId as number } : { src: raw.src as string }),
      ...(title ? { title } : {}),
      ...(artist ? { artist } : {}),
      ...(raw.artworkAssetId !== undefined ? { artworkAssetId: raw.artworkAssetId as number } : {}),
    },
  };
}

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  return base
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-MAX_FILENAME_LENGTH);
}

function optionalText(value: unknown): string | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string" || value.length > MAX_TEXT_LENGTH) {
    return null;
  }
  return value.trim() || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

function isAssetId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isDimension(value: unknown): value is number {
  return (
    typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_DIMENSION
  );
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function fail(message: string): { ok: false; message: string } {
  return { ok: false, message };
}
