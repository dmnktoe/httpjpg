import {
  getStoryblokApi,
  type StoriesParams,
  type StoryblokConfig,
} from "@httpjpg/storyblok-api";

/**
 * Cached Storyblok API utilities for Next.js Server Components
 * Note: Caching is handled by Next.js fetch() cache by default
 */

/**
 * Cached version of getStoryblokApi for production use
 * Reuses the same client instance across requests
 */
export const getCachedStoryblokApi = (config: StoryblokConfig = {}) => {
  return getStoryblokApi(config);
};

/**
 * Cached story fetcher for use in Server Components
 * @example
 * ```ts
 * const story = await fetchStory('home');
 * ```
 */
export const fetchStory = async (
  slug: string,
  config: StoryblokConfig = {},
) => {
  const api = getStoryblokApi(config);
  return api.getStory({ slug });
};

/**
 * Cached stories fetcher for use in Server Components
 * @example
 * ```ts
 * const { stories } = await fetchStories({ starts_with: 'work/' });
 * ```
 */
export const fetchStories = async (
  params: StoriesParams = {},
  config: StoryblokConfig = {},
) => {
  const api = getStoryblokApi(config);
  return api.getStories(params);
};
