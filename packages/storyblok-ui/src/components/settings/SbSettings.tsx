import type { StoryblokLink } from "@httpjpg/storyblok-utils";
import type { SbBlokData } from "@storyblok/react/rsc";

export interface MenuLink extends SbBlokData {
  component: "menu_link";
  label?: string;
  /** Legacy field — historic menu_link entries stored the text as `name` before the schema renamed it to `label`. */
  name?: string;
  link: StoryblokLink;
  variant?: "personal" | "client";
  is_external?: boolean;
  target?: "_self" | "_blank";
}

export interface FooterConfig extends SbBlokData {
  component: "footer_config";
  copyright_text?: string;
  footer_links?: MenuLink[];
  background_image?: { filename: string; alt?: string };
}

/**
 * Top-level `config` Storyblok story shape. Read via
 * `apps/portfolio/lib/queries/config.ts`; not registered as a renderable block.
 */
export interface SbConfigStory extends SbBlokData {
  component: "config";
  header_menu?: MenuLink[];
  footer_config?: FooterConfig[];
  seo_title?: string;
  seo_description?: string;
  author_name?: string;
  author_url?: string;
  psn_username?: string;
  psn_enabled?: boolean;
  spotify_enabled?: boolean;
  discord_user_id?: string;
  nostalgia_slideshow_enabled?: boolean;
  custom_cursor_enabled?: boolean;
  mouse_trail_enabled?: boolean;
  last_updated_badge_enabled?: boolean;
  prev_next_work_enabled?: boolean;
  rss_feed_enabled?: boolean;
}
