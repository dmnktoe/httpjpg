import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";

/**
 * Menu Link Item for Header Navigation
 */
export interface MenuLink extends SbBlokData {
  component: "menu_link";
  label: string;
  link: {
    cached_url: string;
    linktype: string;
    url?: string;
  };
  variant?: "personal" | "client";
  is_external?: boolean;
  target?: "_self" | "_blank";
}

/**
 * Social Link Item
 */
export interface SocialLink extends SbBlokData {
  component: "social_link";
  platform:
    | "instagram"
    | "twitter"
    | "github"
    | "linkedin"
    | "youtube"
    | "facebook";
  url: string;
}

/**
 * Footer Configuration
 */
export interface FooterConfig extends SbBlokData {
  component: "footer_config";
  copyright_text?: string;
  show_default_links?: boolean;
  social_links?: SocialLink[];
  background_image?: {
    filename: string;
    alt?: string;
  };
}

/**
 * Config Story Structure
 * Main configuration story for site-wide settings
 */
export interface SbConfigStory extends SbBlokData {
  component: "config";
  site_name?: string;
  header_menu?: MenuLink[];
  footer_config?: FooterConfig[];
  seo_title?: string;
  seo_description?: string;
}

/**
 * Config Component (not rendered, just for typing)
 * This component exists only to provide TypeScript types for the config story
 */
export const SbConfig = memo(function SbConfig({
  blok: _blok,
}: {
  blok: SbConfigStory;
}) {
  // Config is not rendered directly, it's consumed by layout
  return null;
});
