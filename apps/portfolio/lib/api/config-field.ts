import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { NextResponse } from "next/server";

import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

import { API_ERROR, jsonError } from "./errors";

export const CONFIG_FIELDS = {
  discordUserId: "discord_user_id",
  letterboxdUsername: "letterboxd_username",
  discogsUsername: "discogs_username",
  xUsername: "x_username",
  psnUsername: "psn_username",
} as const;

export type ConfigField = (typeof CONFIG_FIELDS)[keyof typeof CONFIG_FIELDS];

export type ConfigFieldResult =
  | { ok: true; value: string }
  | { ok: false; reason: "unavailable" | "missing" };

export async function resolveConfigField(
  field: ConfigField,
  isValid: (value: unknown) => value is string,
  isDraft: boolean,
): Promise<ConfigFieldResult> {
  try {
    const story = await getStoryblokApi({ draftMode: isDraft }).getStory({
      slug: STORYBLOK_SLUGS.CONFIG,
    });
    if (!story) {
      return { ok: false, reason: "unavailable" };
    }
    const value = (story.content as Record<string, unknown> | undefined)?.[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return { ok: false, reason: "missing" };
    }
    if (!isValid(value)) {
      console.warn(`Ignoring malformed ${field} from Storyblok config`);
      return { ok: false, reason: "missing" };
    }
    return { ok: true, value };
  } catch (error) {
    console.warn(`Failed to fetch ${field} from Storyblok:`, error);
    return { ok: false, reason: "unavailable" };
  }
}

export async function requireConfigField(
  field: ConfigField,
  isValid: (value: unknown) => value is string,
  isDraft: boolean,
): Promise<{ ok: true; value: string } | { ok: false; response: NextResponse }> {
  const result = await resolveConfigField(field, isValid, isDraft);
  if (result.ok) {
    return result;
  }
  if (result.reason === "unavailable") {
    return {
      ok: false,
      response: jsonError(API_ERROR.configUnavailable, 503, {
        message: "Could not load the Storyblok config story",
      }),
    };
  }
  return {
    ok: false,
    response: jsonError(API_ERROR.notConfigured, 501, {
      message: `Set ${field} in the Storyblok config story`,
    }),
  };
}
