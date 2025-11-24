/**
 * @httpjpg/storyblok-ui
 * Storyblok-specific UI components consuming base components from @httpjpg/ui
 */

export {
  SbContainer,
  type SbContainerProps,
} from "./components/container";
export {
  SbGrid,
  type SbGridProps,
} from "./components/grid";
export {
  SbImage,
  type SbImageProps,
  type SbImageType,
} from "./components/image";
export {
  SbPage,
  type SbPageProps,
} from "./components/page";
export {
  SbPageWork,
  type SbPageWorkProps,
} from "./components/page-work";
export {
  SbSection,
  type SbSectionProps,
} from "./components/section";
export {
  type FooterConfig,
  type MenuLink,
  SbConfig,
  type SbConfigStory,
  type SocialLink,
} from "./components/settings/SbSettings";
export {
  SbSlideshow,
  type SbSlideshowProps,
} from "./components/slideshow";
export {
  StoryblokLink,
  type StoryblokLinkObject,
  type StoryblokLinkProps,
} from "./components/storyblok-link";
export {
  SbText,
  type SbTextProps,
} from "./components/text";
export {
  SbVideo,
  type SbVideoAssetType,
  type SbVideoProps,
} from "./components/video";
export {
  SbWorkList,
  type SbWorkListProps,
} from "./components/work-list";

// Export shared types
export type {
  BaseStoryblokProps,
  LayoutProps,
  SpacingProps,
  StoryblokApiResponse,
  StoryblokImage,
  StoryblokLink as StoryblokLinkType,
  StoryblokRichText,
  StoryblokStory,
  StoryMetadata,
} from "./types";
