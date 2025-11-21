import { env } from "@httpjpg/env";
import StoryblokClient from "storyblok-js-client";

/**
 * Storyblok API Client Configuration
 */
export interface StoryblokConfig {
  draftMode?: boolean;
  cache?: RequestCache;
}

/**
 * Story parameters for fetching content
 */
export interface StoryParams {
  slug: string;
  resolve_relations?: string[];
  resolve_links?: "url" | "story";
}

/**
 * Stories parameters for fetching multiple stories
 */
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
}

/**
 * Get Storyblok API client with proper configuration
 */
export function getStoryblokApi(config: StoryblokConfig = {}) {
  const { draftMode = false } = config;

  // Initialize client with access token
  const accessToken =
    draftMode && env.STORYBLOK_PREVIEW_TOKEN
      ? env.STORYBLOK_PREVIEW_TOKEN
      : env.NEXT_PUBLIC_STORYBLOK_TOKEN;

  const client = new StoryblokClient({
    accessToken,
    cache: {
      clear: "auto",
      type: "memory",
    },
  });

  /**
   * Get a single story by slug
   */
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
      console.error(`Error fetching story: ${params.slug}`, error);
      return null;
    }
  }

  /**
   * Get multiple stories with filtering options
   */
  async function getStories(params: StoriesParams = {}) {
    const version = draftMode ? "draft" : env.NEXT_PUBLIC_STORYBLOK_VERSION;

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
      });

      return {
        stories: response.data.stories,
        total: response.total,
        perPage: response.perPage,
      };
    } catch (error) {
      console.error("Error fetching stories", error);
      return {
        stories: [],
        total: 0,
        perPage: 0,
      };
    }
  }

  /**
   * Get all slugs for static generation
   */
  async function getAllSlugs(params: { starts_with?: string } = {}) {
    const version = draftMode ? "draft" : env.NEXT_PUBLIC_STORYBLOK_VERSION;

    try {
      const response = await client.get("cdn/links", {
        version,
        starts_with: params.starts_with,
      });

      const links = response.data.links || {};

      return Object.values(links).map((link: any) => ({
        slug: link.slug,
        id: link.id,
        isFolder: link.is_folder,
      }));
    } catch (error) {
      console.error("Error fetching slugs", error);
      return [];
    }
  }

  return {
    client,
    getStory,
    getStories,
    getAllSlugs,
  };
}

/**
 * Cache tags for Next.js revalidation
 */
export const CACHE_TAGS = {
  STORY: (slug: string) => `story-${slug}`,
  STORIES: "stories",
  CONFIG: "storyblok-config",
} as const;
