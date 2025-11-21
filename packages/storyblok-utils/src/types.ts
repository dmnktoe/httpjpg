/**
 * Base Storyblok Block type
 */
export interface BlokItem {
  _uid: string;
  component: string;
  [key: string]: unknown;
}

/**
 * Storyblok Story type
 */
export interface StoryblokStory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: BlokItem;
  created_at: string;
  published_at: string;
  [key: string]: unknown;
}

/**
 * Storyblok Asset type
 */
export interface StoryblokAsset {
  id: number;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: string;
}

/**
 * Storyblok Link type
 */
export interface StoryblokLink {
  id?: string;
  url?: string;
  linktype?: "url" | "story" | "asset" | "email";
  fieldtype?: string;
  cached_url?: string;
  story?: StoryblokStory;
}
