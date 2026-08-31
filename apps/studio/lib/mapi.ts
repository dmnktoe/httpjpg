import { env } from "@httpjpg/env";

export const STORYBLOK_MAPI = "https://mapi.storyblok.com/v1";

export type StudioAuth =
  | { ok: true; token: string; spaceId: string }
  | { ok: false; status: 404 | 500; error: string };

interface StudioRuntime {
  NODE_ENV: string;
  STORYBLOK_MANAGEMENT_TOKEN?: string;
  STORYBLOK_SPACE_ID?: string;
}

export function resolveStudioAuth(runtime: StudioRuntime): StudioAuth {
  if (runtime.NODE_ENV !== "development") {
    return { ok: false, status: 404, error: "Not found" };
  }
  const token = runtime.STORYBLOK_MANAGEMENT_TOKEN;
  const spaceId = runtime.STORYBLOK_SPACE_ID;
  if (!token || !spaceId) {
    return {
      ok: false,
      status: 500,
      error: "STORYBLOK_MANAGEMENT_TOKEN or STORYBLOK_SPACE_ID not set",
    };
  }
  return { ok: true, token, spaceId };
}

export function studioAuth(): StudioAuth {
  return resolveStudioAuth(env);
}

export function mapiPath(spaceId: string, path: string): string {
  return `${STORYBLOK_MAPI}/spaces/${spaceId}${path}`;
}
