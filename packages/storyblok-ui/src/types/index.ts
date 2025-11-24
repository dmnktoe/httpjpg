import type { SbBlokData } from "@storyblok/react/rsc";

/**
 * Extended Storyblok types for better type safety
 */

/**
 * Common spacing properties used across Storyblok components
 */
export interface SpacingProps {
  pt?: string;
  pb?: string;
  py?: string;
  mt?: string;
  mb?: string;
  my?: string;
}

/**
 * Common layout properties
 */
export interface LayoutProps {
  width?: "full" | "container" | "narrow";
  bgColor?: string;
}

/**
 * Base props for all Storyblok components
 */
export interface BaseStoryblokProps {
  blok: SbBlokData & {
    _uid: string;
    component: string;
  };
}

/**
 * Storyblok Story metadata
 */
export interface StoryMetadata {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  created_at: string;
  published_at: string;
  first_published_at: string;
  sort_by_date?: string;
  position: number;
  tag_list: string[];
  is_startpage: boolean;
  parent_id: number | null;
  lang: string;
}

/**
 * Complete Storyblok Story with content
 */
export interface StoryblokStory<T = SbBlokData> extends StoryMetadata {
  content: T;
  alternates: Array<{
    id: number;
    name: string;
    slug: string;
    published: boolean;
    full_slug: string;
    is_folder: boolean;
    parent_id: number;
  }>;
  translated_slugs: Array<{
    lang: string;
    name: string;
    path: string;
  }> | null;
}

/**
 * Storyblok API Response
 */
export interface StoryblokApiResponse<T = SbBlokData> {
  data: {
    story: StoryblokStory<T>;
    cv: number;
    rels: unknown[];
    links: unknown[];
  };
}

/**
 * Storyblok Image Asset
 */
export interface StoryblokImage {
  id?: number;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: "asset";
}

/**
 * Storyblok Link
 */
export interface StoryblokLink {
  id?: string;
  url?: string;
  linktype?: "url" | "story" | "asset" | "email";
  fieldtype?: "multilink";
  cached_url?: string;
  anchor?: string;
  target?: "_blank" | "_self";
  email?: string;
  story?: StoryblokStory;
}

/**
 * Base Storyblok Block
 */
export interface StoryblokBlok {
  _uid: string;
  component: string;
  _editable?: string;
  [key: string]: unknown;
}

/**
 * Storyblok Video Asset
 */
export interface StoryblokVideoAsset {
  id?: number;
  alt?: string;
  name?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: "asset";
}

/**
 * Storyblok Rich Text
 */
export interface StoryblokRichText {
  type: "doc";
  content: Array<{
    type: string;
    content?: unknown[];
    attrs?: Record<string, unknown>;
    marks?: Array<{
      type: string;
      attrs?: Record<string, unknown>;
    }>;
    text?: string;
  }>;
}
