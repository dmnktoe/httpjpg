/* eslint-disable */
// AUTO-GENERATED — run `pnpm --filter @httpjpg/storyblok-sync codegen`.

import type { StoryblokBlokData, StoryblokImage, StoryblokLink, StoryblokRichText } from "./types";

export interface BlokSpacing {
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  pt?: string;
  pb?: string;
  pl?: string;
  pr?: string;
  mtMd?: string;
  mbMd?: string;
  mlMd?: string;
  mrMd?: string;
  ptMd?: string;
  pbMd?: string;
  plMd?: string;
  prMd?: string;
  mtLg?: string;
  mbLg?: string;
  mlLg?: string;
  mrLg?: string;
  ptLg?: string;
  pbLg?: string;
  plLg?: string;
  prLg?: string;
}

export interface SbSectionData extends StoryblokBlokData, BlokSpacing {
  component: "section";
  content: Array<SbContainerData | SbGridData | SbHeadlineData | SbParagraphData>;
  bgColor?: string;
  useContainer?: boolean;
  containerSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";
  containerAlign?: "left" | "center";
}

export interface SbContainerData extends StoryblokBlokData, BlokSpacing {
  component: "container";
  body: StoryblokBlokData[];
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";
  center?: boolean;
  bgColor?: string;
}

export interface SbGridData extends StoryblokBlokData, BlokSpacing {
  component: "grid";
  items: StoryblokBlokData[];
  columns?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "auto";
  columnsMd?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "auto";
  columnsLg?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "auto";
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  flow?: "row" | "column" | "row-dense" | "column-dense";
  isList?: boolean;
}

export interface SbGridItemData extends StoryblokBlokData {
  component: "grid_item";
  content?: StoryblokBlokData[];
  colSpan?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "full";
  colSpanMd?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "full";
  colSpanLg?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "full";
  rowSpan?: string;
  rowSpanMd?: string;
  rowSpanLg?: string;
  colStart?: string;
  colEnd?: string;
  rowStart?: string;
  rowEnd?: string;
  alignSelf?: "start" | "center" | "end" | "stretch" | "baseline";
  justifySelf?: "start" | "center" | "end" | "stretch";
}

export interface SbHeadlineData extends StoryblokBlokData, BlokSpacing {
  component: "headline";
  text: string;
  level?: "1" | "2" | "3";
  align?: "left" | "center" | "right" | "justify";
  color?: string;
}

export interface SbParagraphData extends StoryblokBlokData, BlokSpacing {
  component: "paragraph";
  text: string;
  size?: "sm" | "md" | "base" | "lg" | "xl";
  weight?:
    | "thin"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
  align?: "left" | "center" | "right" | "justify";
  color?: string;
}

export interface SbRichtextData extends StoryblokBlokData, BlokSpacing {
  component: "richtext";
  content: StoryblokRichText;
  maxWidth?: "none" | "45ch" | "65ch" | "80ch" | "100ch";
  color?: string;
}

export interface SbButtonData extends StoryblokBlokData, BlokSpacing {
  component: "button";
  text: string;
  variant?: "primary" | "secondary" | "outline" | "disabled";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  link?: StoryblokLink;
}

export interface SbWorkCardData extends StoryblokBlokData, BlokSpacing {
  component: "work_card";
  title: string;
  description?: string;
  slug: string;
  images: StoryblokImage[];
  date?: string;
  date_end?: string;
  variant?: "default" | "compact" | "featured";
  baseUrl?: string;
  priority?: boolean;
  tags?: string;
  overlay?:
    | "none"
    | "random"
    | "stars"
    | "sparkles"
    | "hearts"
    | "confetti"
    | "tape"
    | "dots"
    | "arrows"
    | "ghost"
    | "bracket"
    | "noise"
    | "runes";
  overlayInset?: string;
}

export interface SbWorkListData extends StoryblokBlokData, BlokSpacing {
  component: "work_list";
  work?: string[];
  gap?: string;
  columns?: "1" | "2" | "3" | "4";
  columnsMd?: "1" | "2" | "3" | "4";
  columnsLg?: "1" | "2" | "3" | "4";
  variant?: "default" | "compact" | "featured";
  enableTagFilter?: boolean;
  showDividers?: boolean;
  dividerVariant?: "solid" | "dashed" | "dotted" | "ascii";
  dividerPattern?: string;
  dividerColor?: string;
  dividerSpacing?: string;
}

export interface SbImageData extends StoryblokBlokData, BlokSpacing {
  component: "image";
  image: StoryblokImage;
  alt?: string;
  caption?: StoryblokRichText;
  copyrightPosition?: "inline-white" | "inline-black" | "overlay" | "below";
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16" | "21/9";
  width?: "5%" | "25%" | "33%" | "50%" | "65%" | "75%" | "100%";
  widthMd?: "5%" | "25%" | "33%" | "50%" | "65%" | "75%" | "100%";
  widthLg?: "5%" | "25%" | "33%" | "50%" | "65%" | "75%" | "100%";
  isLoadingEager?: boolean;
  fetchPriority?: "auto" | "high" | "low";
  blurOnLoad?: boolean;
  overlay?:
    | "none"
    | "random"
    | "stars"
    | "sparkles"
    | "hearts"
    | "confetti"
    | "tape"
    | "dots"
    | "arrows"
    | "ghost"
    | "bracket"
    | "noise"
    | "runes";
  parallax?: string;
}

export interface SbVideoData extends StoryblokBlokData, BlokSpacing {
  component: "video";
  video?: StoryblokImage;
  videoUrl?: string;
  source?: "native" | "youtube" | "vimeo";
  poster?: StoryblokImage;
  caption?: StoryblokRichText;
  copyrightPosition?: "inline-white" | "inline-black" | "overlay" | "below";
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16" | "21/9";
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface SbSlideshowData extends StoryblokBlokData, BlokSpacing {
  component: "slideshow";
  images: StoryblokImage[];
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16" | "21/9";
  effect?: "slide" | "fade" | "cube" | "coverflow" | "flip" | "cards" | "creative";
  autoplayDelay?: string;
  speed?: string;
  showNavigation?: boolean;
  animation?:
    | "none"
    | "fadeIn"
    | "zoomIn"
    | "slideInFromLeft"
    | "slideInFromRight"
    | "slideUp"
    | "slideDown";
  animationDelay?: string;
  overlay?:
    | "none"
    | "random"
    | "stars"
    | "sparkles"
    | "hearts"
    | "confetti"
    | "tape"
    | "dots"
    | "arrows"
    | "ghost"
    | "bracket"
    | "noise"
    | "runes";
  overlayInset?: string;
  showCounter?: boolean;
}

export interface SbMusicPlayerData extends StoryblokBlokData, BlokSpacing {
  component: "music_player";
  source?: "spotify" | "soundcloud" | "mp3" | "custom";
  src: string;
  title?: string;
  artist?: string;
  artwork?: string;
  spotifySize?: "compact" | "normal";
  showArtwork?: boolean;
  showInfo?: boolean;
  autoPlay?: boolean;
  decoration?: string;
  headerText?: string;
  footerText?: string;
}

export interface SbMarqueeData extends StoryblokBlokData, BlokSpacing {
  component: "marquee";
  text: string;
  speed?: string;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  repeat?: string;
  iosStyle?: boolean;
  pauseDuration?: string;
  bgColor?: string;
  textColor?: string;
}

export interface SbPageData extends StoryblokBlokData {
  component: "page";
  body?: StoryblokBlokData[];
  title?: string;
  isDark?: boolean;
}

export interface SbWorkData extends StoryblokBlokData {
  component: "work";
  body?: StoryblokBlokData[];
  title?: string;
  description?: StoryblokRichText;
  images?: StoryblokImage[];
  date?: string;
  date_end?: string;
  link?: StoryblokLink;
  external_only?: boolean;
  isDark?: boolean;
}

export interface SbMenuLinkData extends StoryblokBlokData {
  component: "menu_link";
  label: string;
  link: StoryblokLink;
  variant?: "personal" | "client";
  is_external?: boolean;
  target?: "_self" | "_blank";
}

export interface SbFooterConfigData extends StoryblokBlokData {
  component: "footer_config";
  copyright_text?: string;
  footer_links?: Array<SbMenuLinkData>;
  background_image?: StoryblokImage;
}

export interface SbConfigData extends StoryblokBlokData {
  component: "config";
  header_menu?: Array<SbMenuLinkData>;
  footer_config?: Array<SbFooterConfigData>;
  seo_title?: string;
  seo_description?: string;
  author_name?: string;
  author_url?: string;
  spotify_enabled?: boolean;
  nostalgia_slideshow_enabled?: boolean;
  psn_enabled?: boolean;
  psn_username?: string;
  discord_user_id?: string;
  custom_cursor_enabled?: boolean;
  mouse_trail_enabled?: boolean;
  last_updated_badge_enabled?: boolean;
  prev_next_work_enabled?: boolean;
  rss_feed_enabled?: boolean;
}

export type SbBlokName =
  | "section"
  | "container"
  | "grid"
  | "grid_item"
  | "headline"
  | "paragraph"
  | "richtext"
  | "button"
  | "work_card"
  | "work_list"
  | "image"
  | "video"
  | "slideshow"
  | "music_player"
  | "marquee"
  | "page"
  | "work"
  | "menu_link"
  | "footer_config"
  | "config";

export interface SbBlokRegistry {
  section: SbSectionData;
  container: SbContainerData;
  grid: SbGridData;
  grid_item: SbGridItemData;
  headline: SbHeadlineData;
  paragraph: SbParagraphData;
  richtext: SbRichtextData;
  button: SbButtonData;
  work_card: SbWorkCardData;
  work_list: SbWorkListData;
  image: SbImageData;
  video: SbVideoData;
  slideshow: SbSlideshowData;
  music_player: SbMusicPlayerData;
  marquee: SbMarqueeData;
  page: SbPageData;
  work: SbWorkData;
  menu_link: SbMenuLinkData;
  footer_config: SbFooterConfigData;
  config: SbConfigData;
}

export type SbBlok = SbBlokRegistry[SbBlokName];
