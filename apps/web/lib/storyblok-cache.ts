import {
  getStoryblokApi,
  type StoriesParams,
  type StoryblokConfig,
} from "@httpjpg/storyblok-api";
import { cache } from "react";

/**
 * Cached Storyblok API utilities for Next.js Server Components
 * These use React's cache() for request-level memoization
 */

/**
 * Cached version of getStoryblokApi for production use
 * Reuses the same client instance across requests
 */
export const getCachedStoryblokApi = cache((config: StoryblokConfig = {}) => {
  return getStoryblokApi(config);
});

/**
 * Cached story fetcher for use in Server Components
 * @example
 * ```ts
 * const story = await fetchStory('home');
 * ```
 */
export const fetchStory = cache(
  async (slug: string, config: StoryblokConfig = {}) => {
    const api = getStoryblokApi(config);
    return api.getStory({ slug });
  },
);

/**
 * Cached stories fetcher for use in Server Components
 * @example
 * ```ts
 * const { stories } = await fetchStories({ starts_with: 'work/' });
 * ```
 */
export const fetchStories = cache(
  async (params: StoriesParams = {}, config: StoryblokConfig = {}) => {
    const api = getStoryblokApi(config);
    return api.getStories(params);
  },
);
