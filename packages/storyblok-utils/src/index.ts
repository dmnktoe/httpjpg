export type { BlokSpacing, SbBlok, SbBlokName, SbBlokRegistry } from "./blok-types.gen";
export * from "./cms-options";
export { extractPlainText } from "./extract-plain-text";
export { imagePreset } from "./image-presets";
export { getResponsiveImage } from "./image-processing";
export type { ResponsiveImage, ResponsiveImageOptions } from "./image-processing";
export { firstImageFilename, toSlideshowImage } from "./media-utils";
export { validateStoryblokPreviewToken } from "./preview";
export type {
  StoryblokApiResponse,
  StoryblokBlokData,
  StoryblokImage,
  StoryblokLink,
  StoryblokRichText,
  StoryblokStory,
  StoryblokVideoAsset,
  StoryMetadata,
} from "./types";

/** Storyblok `resolve_relations` slugs. Used by fetchStory / getStories. */
export const STORYBLOK_RELATIONS = {
  WORK_LIST: "work_list.work",
} as const;
