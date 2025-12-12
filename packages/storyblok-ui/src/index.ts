/**
 * @httpjpg/storyblok-ui
 * Storyblok-specific UI components consuming base components from @httpjpg/ui
 */

export {
  SbButton,
  type SbButtonProps,
} from "./components/button";
export {
  SbCaption,
  type SbCaptionProps,
} from "./components/caption";
export {
  SbContainer,
  type SbContainerProps,
} from "./components/container";
export {
  SbGrid,
  type SbGridProps,
} from "./components/grid";
export {
  SbHeadline,
  type SbHeadlineProps,
} from "./components/headline";
export {
  SbImage,
  type SbImageProps,
} from "./components/image";
export {
  SbLink,
  type SbLinkProps,
  type StoryblokLinkObject,
} from "./components/link";
export {
  SbMediaWrapper,
  type SbMediaWrapperProps,
} from "./components/media-wrapper";
export {
  SbMissing,
  type SbMissingProps,
} from "./components/missing";
export {
  SbMusicPlayer,
  type SbMusicPlayerProps,
} from "./components/music-player";
export {
  SbPage,
  type SbPageProps,
} from "./components/page";
export {
  SbPageWork,
  type SbPageWorkProps,
} from "./components/page-work";
export {
  SbParagraph,
  type SbParagraphProps,
} from "./components/paragraph";
export {
  SbRichText,
  type SbRichTextProps,
} from "./components/richtext";
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
  SbVideo,
  type SbVideoProps,
} from "./components/video";
export {
  SbWorkCard,
  type SbWorkCardProps,
} from "./components/work-card";
// TODO: Ensure work_list component is synced to Storyblok CMS
// Component registered but not available in CMS, causing runtime warnings
export {
  SbWorkList,
  type SbWorkListProps,
} from "./components/work-list";
// Export constants
export {
  ASPECT_RATIOS,
  type AspectRatio,
  CONTAINER_WIDTHS,
  COPYRIGHT_POSITIONS,
  type CopyrightPosition,
  DEFAULTS,
  IMAGE_SIZES,
  type ImageSize,
  SPACING_SIZES,
  type SpacingSize,
  VIDEO_SOURCES,
  type VideoSource,
  WIDTH_OPTIONS,
  type WidthOption,
} from "./lib/constants";
// Lib exports
export { resolveWorkRelations } from "./lib/resolve-work-relations";
// Export utility functions
export {
  getLayoutStyles,
  getSpacingStyles,
  getWidthStyles,
  mapSpacingToToken,
} from "./lib/spacing-utils";
// Export token mapping functions
export {
  mapAnimationDurationToToken,
  mapAnimationEasingToToken,
  mapAspectRatioToToken,
  mapColorToToken,
  mapFontFamilyToToken,
  mapFontSizeToToken,
  mapFontWeightToToken,
  mapGridColumnsToToken,
  mapProseMaxWidthToToken,
  mapWidthToToken,
} from "./lib/token-mapping";
export { useStoryblokEditable } from "./lib/use-storyblok-editable";
// Export shared types
export type {
  BaseStoryblokProps,
  LayoutProps,
  SpacingProps,
  StoryblokApiResponse,
  StoryblokBlok,
  StoryblokImage,
  StoryblokLink as StoryblokLinkType,
  StoryblokRichText,
  StoryblokStory,
  StoryblokVideoAsset,
  StoryMetadata,
} from "./types";
