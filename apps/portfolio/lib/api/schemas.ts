import { z } from "zod";

export const discordStatusSchema = z.enum(["online", "idle", "dnd", "offline"]);

export const discordPresenceSchema = z.object({
  status: discordStatusSchema,
  activity: z.string().nullable().optional(),
  activityDetails: z
    .union([
      z.object({
        type: z.literal("game"),
        name: z.string(),
        platform: z.string().nullable(),
        playtime: z.string().nullable(),
        icon: z.string().nullable(),
      }),
      z.object({
        type: z.literal("custom"),
        text: z.string(),
        emoji: z.string(),
      }),
    ])
    .nullable()
    .optional(),
});

export const weatherResponseSchema = z.object({
  temperature: z.number(),
  code: z.number(),
  emoji: z.string(),
  condition: z.string(),
  isDay: z.boolean(),
});

export const letterboxdFilmSchema = z.object({
  title: z.string(),
  year: z.string().nullable(),
  rating: z.number().nullable(),
  rewatch: z.boolean(),
  liked: z.boolean(),
  watchedDate: z.string().nullable(),
  url: z.string(),
  poster: z.string().nullable(),
});

export const letterboxdResponseSchema = z.object({
  films: z.array(letterboxdFilmSchema),
});

export const discogsReleaseSchema = z.object({
  title: z.string(),
  artist: z.string(),
  year: z.string().nullable(),
  format: z.string().nullable(),
  addedAt: z.string().nullable(),
  url: z.string(),
  thumb: z.string().nullable(),
});

export const discogsResponseSchema = z.object({
  releases: z.array(discogsReleaseSchema),
});

export const psnTrophyTypeSchema = z.enum(["bronze", "silver", "gold", "platinum"]);

export const psnTrophySchema = z.object({
  name: z.string(),
  game: z.string(),
  platform: z.string().nullable(),
  type: psnTrophyTypeSchema,
  description: z.string().nullable(),
  earnedAt: z.string().nullable(),
  url: z.string(),
  image: z.string().nullable(),
});

export const psnTrophiesResponseSchema = z.object({
  trophies: z.array(psnTrophySchema),
  avatar: z.string().nullable(),
});

export const xProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  followerCount: z.number().nullable(),
});

export const xPostSchema = z.object({
  id: z.string(),
  text: z.string(),
  url: z.string(),
  createdAt: z.string().nullable(),
  hasMedia: z.boolean(),
  isSensitive: z.boolean(),
  isQuote: z.boolean(),
});

export const xTimelineSchema = z.object({
  profile: xProfileSchema,
  posts: z.array(xPostSchema),
});

export const SEARCH_MAX_QUERY_LENGTH = 120;
export const SEARCH_DEFAULT_LIMIT = 8;
export const SEARCH_MAX_LIMIT = 20;

export const searchMediaSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "video", "audio"]),
  thumb: z.string(),
  source: z.string().optional(),
  focus: z.string().optional(),
  label: z.string(),
});

export const searchResultSchema = z.object({
  id: z.string(),
  href: z.string(),
  title: z.string(),
  kind: z.enum(["work", "page"]),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  media: z.array(searchMediaSchema).optional(),
});

export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  suggestions: z.array(z.string()),
});

export function parseSearchParams(params: URLSearchParams): { query: string; limit: number } {
  const query = (params.get("q") ?? "").trim().slice(0, SEARCH_MAX_QUERY_LENGTH);
  const parsed = Number.parseInt(params.get("limit") ?? "", 10);
  const limit =
    !Number.isFinite(parsed) || parsed < 1
      ? SEARCH_DEFAULT_LIMIT
      : Math.min(parsed, SEARCH_MAX_LIMIT);
  return { query, limit };
}
