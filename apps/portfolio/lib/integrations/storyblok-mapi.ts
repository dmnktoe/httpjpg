import { env } from "@httpjpg/env";

const STORYBLOK_MAPI = "https://mapi.storyblok.com/v1";

export interface MapiConfig {
  token: string;
  spaceId: string;
}

export class StoryblokMapiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StoryblokMapiError";
    this.status = status;
  }
}

export function mapiConfig(): MapiConfig | null {
  const token = env.STORYBLOK_MANAGEMENT_TOKEN;
  const spaceId = env.STORYBLOK_SPACE_ID;
  return token && spaceId ? { token, spaceId } : null;
}

export interface SignedAssetUpload {
  id: number;
  uploadUrl: string;
  fields: Record<string, string>;
}

export async function signAssetUpload(
  config: MapiConfig,
  upload: { filename: string; size?: string },
): Promise<SignedAssetUpload> {
  const signed = await mapiRequest<{
    id?: number;
    post_url?: string;
    fields?: Record<string, string>;
  }>(config, "/assets/", {
    method: "POST",
    body: JSON.stringify({
      filename: upload.filename,
      ...(upload.size ? { size: upload.size } : {}),
      validate_upload: 1,
    }),
  });
  if (!signed.id || !signed.post_url || !signed.fields) {
    throw new StoryblokMapiError(502, "Storyblok returned a malformed signed upload");
  }
  return { id: signed.id, uploadUrl: signed.post_url, fields: signed.fields };
}

interface MapiAsset {
  id?: number;
  filename?: string;
}

export async function finishAssetUpload(config: MapiConfig, assetId: number): Promise<string> {
  const finished = await mapiRequest<MapiAsset & { asset?: MapiAsset }>(
    config,
    `/assets/${assetId}/finish_upload`,
  );
  const filename =
    assetFilename(finished) ??
    assetFilename(
      await mapiRequest<MapiAsset & { asset?: MapiAsset }>(config, `/assets/${assetId}`),
    );
  if (!filename) {
    throw new StoryblokMapiError(502, `Storyblok asset ${assetId} has no file`);
  }
  return filename;
}

export async function ensureFolder(
  config: MapiConfig,
  folder: { slug: string; name: string },
): Promise<number> {
  const found = await mapiRequest<{ stories?: Array<{ id: number; is_folder?: boolean }> }>(
    config,
    `/stories?with_slug=${encodeURIComponent(folder.slug)}`,
  );
  const existing = found.stories?.find((story) => story.is_folder);
  if (existing) {
    return existing.id;
  }
  const created = await mapiRequest<{ story?: { id?: number } }>(config, "/stories", {
    method: "POST",
    body: JSON.stringify({
      story: { name: folder.name, slug: folder.slug, is_folder: true, parent_id: 0 },
    }),
  });
  if (!created.story?.id) {
    throw new StoryblokMapiError(502, `Storyblok did not create the "${folder.slug}" folder`);
  }
  return created.story.id;
}

export async function findStory(
  config: MapiConfig,
  fullSlug: string,
): Promise<CreatedStory | null> {
  const found = await mapiRequest<{
    stories?: Array<{ id: number; full_slug?: string; is_folder?: boolean }>;
  }>(config, `/stories?with_slug=${encodeURIComponent(fullSlug)}`);
  const story = found.stories?.find((entry) => !entry.is_folder && entry.full_slug === fullSlug);
  return story ? { id: story.id, fullSlug } : null;
}

export interface CreatedStory {
  id: number;
  fullSlug: string;
}

export async function createPublishedStory(
  config: MapiConfig,
  story: { name: string; slug: string; parentId: number; content: Record<string, unknown> },
): Promise<CreatedStory> {
  const created = await mapiRequest<{ story?: { id?: number; full_slug?: string } }>(
    config,
    "/stories?publish=1",
    {
      method: "POST",
      body: JSON.stringify({
        story: {
          name: story.name,
          slug: story.slug,
          parent_id: story.parentId,
          content: story.content,
        },
        publish: 1,
      }),
    },
  );
  if (!created.story?.id || !created.story.full_slug) {
    throw new StoryblokMapiError(502, "Storyblok returned a malformed story");
  }
  return { id: created.story.id, fullSlug: created.story.full_slug };
}

async function mapiRequest<T>(
  config: MapiConfig,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${STORYBLOK_MAPI}/spaces/${config.spaceId}${path}`, {
    ...init,
    headers: { Authorization: config.token, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new StoryblokMapiError(
      response.status,
      `Storyblok ${init.method ?? "GET"} ${path} failed (${response.status}): ${detail}`,
    );
  }
  return (await response.json()) as T;
}

function assetFilename(response: MapiAsset & { asset?: MapiAsset }): string | undefined {
  const filename = response.asset?.filename ?? response.filename;
  return filename ? toCdnUrl(filename) : undefined;
}

function toCdnUrl(filename: string): string {
  return filename
    .replace(/^https?:\/\/s3\.amazonaws\.com\/a\.storyblok\.com\//, "https://a.storyblok.com/")
    .replace(/^\/\/a\.storyblok\.com\//, "https://a.storyblok.com/");
}
