import { env } from "@httpjpg/env";
import StoryblokClient from "storyblok-js-client";

export interface StoryblokConfig {
  draftMode?: boolean;
}

export interface StoryParams {
  slug: string;
  resolve_relations?: string[];
  resolve_links?: "url" | "story";
}

export interface StoriesParams {
  starts_with?: string;
  by_slugs?: string;
  excluding_slugs?: string;
  resolve_relations?: string[];
  resolve_links?: "url" | "story";
  per_page?: number;
  page?: number;
  sort_by?: string;
  filter_query?: Record<string, unknown>;
  cv?: number;
  version?: "draft" | "published";
}

function readStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const err = error as { status?: number; response?: { status?: number } };
  return err.status ?? err.response?.status;
}

export function getStoryblokApi(config: StoryblokConfig = {}) {
  const { draftMode = false } = config;
  const accessToken =
    draftMode && env.STORYBLOK_PREVIEW_TOKEN
      ? env.STORYBLOK_PREVIEW_TOKEN
      : env.NEXT_PUBLIC_STORYBLOK_TOKEN;

  const client = new StoryblokClient({
    accessToken,
    cache: { clear: "auto", type: "memory" },
  });

  async function getStory(params: StoryParams) {
    const version = draftMode ? "draft" : env.NEXT_PUBLIC_STORYBLOK_VERSION;
    try {
      const response = await client.get(`cdn/stories/${params.slug}`, {
        version,
        resolve_relations: params.resolve_relations?.join(","),
        resolve_links: params.resolve_links,
      });
      return response.data.story;
    } catch (error) {
      const status = readStatus(error);
      if (status === 404 || status === 401 || status === 403) {
        return null;
      }
      console.error(`Error fetching story: ${params.slug}`, error);
      return null;
    }
  }

  async function getStories(params: StoriesParams = {}) {
    const version = params.version || (draftMode ? "draft" : env.NEXT_PUBLIC_STORYBLOK_VERSION);
    try {
      const response = await client.get("cdn/stories", {
        version,
        starts_with: params.starts_with,
        by_slugs: params.by_slugs,
        excluding_slugs: params.excluding_slugs,
        resolve_relations: params.resolve_relations?.join(","),
        resolve_links: params.resolve_links,
        per_page: params.per_page || 25,
        page: params.page || 1,
        sort_by: params.sort_by,
        filter_query: params.filter_query,
        cv: params.cv,
      });
      return {
        stories: response.data.stories,
        total: response.total,
        perPage: response.perPage,
      };
    } catch (error) {
      console.error("Error fetching stories", error);
      return { stories: [], total: 0, perPage: 0 };
    }
  }

  async function getAllSlugs(params: { starts_with?: string } = {}) {
    const version = draftMode ? "draft" : env.NEXT_PUBLIC_STORYBLOK_VERSION;
    try {
      const response = await client.get("cdn/links", {
        version,
        starts_with: params.starts_with,
      });
      const links = response.data.links;
      if (!links) {
        return [];
      }
      return Object.values(links).map((link) => ({
        slug: link.slug ?? "",
        id: link.id,
        isFolder: link.is_folder ?? false,
      }));
    } catch (error) {
      console.error("Error fetching slugs", error);
      return [];
    }
  }

  return { client, getStory, getStories, getAllSlugs };
}
