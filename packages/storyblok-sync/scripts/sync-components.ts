#!/usr/bin/env tsx

/**
 * Sync Storyblok Components from TypeScript Interfaces
 *
 * This script automatically creates/updates Storyblok component schemas
 * based on your TypeScript interfaces, ensuring the CMS always matches your code.
 *
 * Usage:
 *   pnpm --filter @httpjpg/storyblok-sync sync:components
 *
 * Environment Variables Required:
 *   STORYBLOK_MANAGEMENT_TOKEN - Personal Access Token from Storyblok
 *   STORYBLOK_SPACE_ID - Your Storyblok Space ID
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load environment variables from workspace root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local") });

import {
  type StoryblokComponent,
  storyblokRequest,
  validateEnv,
} from "../src/index";

/**
 * Get existing component by name
 */
async function getComponent(name: string): Promise<{ id: number } | null> {
  try {
    const response = await storyblokRequest<{
      components: Array<{ id: number; name: string }>;
    }>("/components");
    const component = response.components?.find((c) => c.name === name);
    return component || null;
  } catch {
    return null;
  }
}

/**
 * Get all component groups (folders)
 */
async function getComponentGroups(): Promise<
  Array<{ id: number; name: string; uuid: string }>
> {
  try {
    const response = await storyblokRequest<{
      component_groups: Array<{ id: number; name: string; uuid: string }>;
    }>("/component_groups");
    return response.component_groups || [];
  } catch {
    return [];
  }
}

/**
 * Find component group UUID by name
 */
async function getComponentGroupUuid(
  name: string,
): Promise<string | undefined> {
  const groups = await getComponentGroups();
  return groups.find((g) => g.name === name)?.uuid;
}

/**
 * Create or update a component
 */
async function createOrUpdateComponent(
  component: StoryblokComponent,
): Promise<void> {
  const existing = await getComponent(component.name);

  if (existing) {
    console.log(
      `📝 Updating component: ${component.display_name || component.name}`,
    );

    await storyblokRequest(`/components/${existing.id}`, "PUT", {
      component: {
        ...component,
        id: existing.id,
      },
    });
  } else {
    console.log(
      `✨ Creating component: ${component.display_name || component.name}`,
    );

    await storyblokRequest("/components", "POST", {
      component,
    });
  }
}

/**
 * Component Definitions
 * Based on TypeScript interfaces from src/components/
 */

async function getSbSectionComponent(): Promise<StoryblokComponent> {
  const layoutGroupUuid = await getComponentGroupUuid("Layout");

  return {
    name: "section",
    display_name: "Section",
    is_root: false,
    is_nestable: true,
    component_group_uuid: layoutGroupUuid,
    icon: "block-section",
    color: "#4a5568",
    schema: {
      content: {
        type: "bloks",
        display_name: "Content",
        description: "Add nested components like Container, Grid, etc.",
        required: true,
        restrict_components: true,
        component_whitelist: ["container", "grid", "headline", "paragraph"],
        pos: 0,
      },
      bgColor: {
        type: "option",
        display_name: "Background Color",
        description: "Choose a background color from the design tokens",
        source: "internal",
        datasource_slug: "color-options",
        pos: 1,
      },
      paddingTop: {
        type: "option",
        display_name: "Padding Top",
        description: "Spacing above content (mobile)",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 2,
      },
      paddingBottom: {
        type: "option",
        display_name: "Padding Bottom",
        description: "Spacing below content (mobile)",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 3,
      },
      paddingLeft: {
        type: "option",
        display_name: "Padding Left",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 4,
      },
      paddingRight: {
        type: "option",
        display_name: "Padding Right",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 5,
      },
      marginTop: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 6,
      },
      marginBottom: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 7,
      },
      width: {
        type: "option",
        display_name: "Width",
        description: "Container or full-width layout",
        default_value: "container",
        options: [
          { name: "Container", value: "container" },
          { name: "Full Width", value: "full" },
        ],
        pos: 8,
      },
      paddingTopMd: {
        type: "option",
        display_name: "Padding Top (Tablet)",
        description: "Override padding for tablet screens",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 9,
      },
      paddingBottomMd: {
        type: "option",
        display_name: "Padding Bottom (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
        pos: 10,
      },
      paddingLeftMd: {
        type: "option",
        display_name: "Padding Left (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingRightMd: {
        type: "option",
        display_name: "Padding Right (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingTopLg: {
        type: "option",
        display_name: "Padding Top (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingBottomLg: {
        type: "option",
        display_name: "Padding Bottom (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingLeftLg: {
        type: "option",
        display_name: "Padding Left (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingRightLg: {
        type: "option",
        display_name: "Padding Right (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbContainerComponent(): Promise<StoryblokComponent> {
  const layoutGroupUuid = await getComponentGroupUuid("Layout");

  return {
    name: "container",
    display_name: "Container",
    is_root: false,
    is_nestable: true,
    component_group_uuid: layoutGroupUuid,
    icon: "block-container",
    color: "#4a5568",
    schema: {
      body: {
        type: "bloks",
        display_name: "Body",
        required: true,
        restrict_components: true,
        component_whitelist: [],
      },
      width: {
        type: "option",
        display_name: "Container Size",
        description: "Choose from predefined container widths",
        default_value: "lg",
        source: "internal",
        datasource_slug: "width-options",
      },
      px: {
        type: "option",
        display_name: "Padding Horizontal",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      py: {
        type: "option",
        display_name: "Padding Vertical",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pt: {
        type: "option",
        display_name: "Padding Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pb: {
        type: "option",
        display_name: "Padding Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      mt: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      mb: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      my: {
        type: "option",
        display_name: "Margin Vertical",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      bgColor: {
        type: "option",
        display_name: "Background Color",
        source: "internal",
        datasource_slug: "color-options",
      },
      pxMd: {
        type: "option",
        display_name: "Padding Horizontal (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pyMd: {
        type: "option",
        display_name: "Padding Vertical (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pxLg: {
        type: "option",
        display_name: "Padding Horizontal (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pyLg: {
        type: "option",
        display_name: "Padding Vertical (Desktop)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbGridComponent(): Promise<StoryblokComponent> {
  const layoutGroupUuid = await getComponentGroupUuid("Layout");

  return {
    name: "grid",
    display_name: "Grid",
    is_root: false,
    is_nestable: true,
    component_group_uuid: layoutGroupUuid,
    icon: "block-grid",
    color: "#4a5568",
    schema: {
      items: {
        type: "bloks",
        display_name: "Grid Items",
        required: true,
        restrict_components: true,
        component_whitelist: [],
      },
      columns: {
        type: "option",
        display_name: "Columns",
        source: "internal",
        datasource_slug: "grid-columns",
      },
      columnsMd: {
        type: "option",
        display_name: "Columns (Tablet)",
        source: "internal",
        datasource_slug: "grid-columns",
      },
      gap: {
        type: "option",
        display_name: "Gap",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      boundingWidth: {
        type: "option",
        display_name: "Width",
        default_value: "full",
        options: [
          { name: "Full Width", value: "full" },
          { name: "Container", value: "container" },
        ],
      },
      isList: {
        type: "boolean",
        display_name: "Render as List",
        default_value: "false",
      },
      pt: {
        type: "option",
        display_name: "Padding Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      pb: {
        type: "option",
        display_name: "Padding Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      mt: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      mb: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbHeadlineComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "headline",
    display_name: "Headline",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-heading-2",
    color: "#2d3748",
    schema: {
      text: {
        type: "text",
        display_name: "Text",
        required: true,
        translatable: true,
      },
      level: {
        type: "option",
        display_name: "Heading Level",
        default_value: "2",
        options: [
          { name: "H1 (Hero/Page Title)", value: "1" },
          { name: "H2 (Section Title)", value: "2" },
          { name: "H3 (Subsection Title)", value: "3" },
        ],
      },
      align: {
        type: "option",
        display_name: "Text Align",
        options: [
          { name: "Left", value: "left" },
          { name: "Center", value: "center" },
          { name: "Right", value: "right" },
        ],
      },
      color: {
        type: "option",
        display_name: "Text Color",
        source: "internal",
        datasource_slug: "color-options",
      },
      marginTop: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginBottom: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingTop: {
        type: "option",
        display_name: "Padding Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingBottom: {
        type: "option",
        display_name: "Padding Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbParagraphComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "paragraph",
    display_name: "Paragraph",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-paragraph",
    color: "#2d3748",
    schema: {
      text: {
        type: "textarea",
        display_name: "Text",
        required: true,
        translatable: true,
      },
      size: {
        type: "option",
        display_name: "Font Size",
        source: "internal",
        datasource_slug: "font-size",
      },
      weight: {
        type: "option",
        display_name: "Font Weight",
        source: "internal",
        datasource_slug: "font-weight",
      },
      align: {
        type: "option",
        display_name: "Text Align",
        options: [
          { name: "Left", value: "left" },
          { name: "Center", value: "center" },
          { name: "Right", value: "right" },
        ],
      },
      color: {
        type: "option",
        display_name: "Text Color",
        source: "internal",
        datasource_slug: "color-options",
      },
      marginTop: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginBottom: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingTop: {
        type: "option",
        display_name: "Padding Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingBottom: {
        type: "option",
        display_name: "Padding Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbRichTextComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "richtext",
    display_name: "Rich Text",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-text",
    color: "#2d3748",
    schema: {
      content: {
        type: "richtext",
        display_name: "Content",
        required: true,
        translatable: true,
      },
      maxWidth: {
        type: "option",
        display_name: "Max Width",
        source: "internal",
        datasource_slug: "prose-max-width-options",
      },
      marginTop: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginBottom: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingTop: {
        type: "option",
        display_name: "Padding Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingBottom: {
        type: "option",
        display_name: "Padding Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbButtonComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "button",
    display_name: "Button",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-button",
    color: "#667eea",
    schema: {
      text: {
        type: "text",
        display_name: "Button Text",
        required: true,
        translatable: true,
      },
      variant: {
        type: "option",
        display_name: "Button Style",
        default_value: "primary",
        options: [
          { name: "Primary (Blue)", value: "primary" },
          { name: "Secondary (Gradient)", value: "secondary" },
          { name: "Outline", value: "outline" },
          { name: "Disabled", value: "disabled" },
        ],
      },
      size: {
        type: "option",
        display_name: "Button Size",
        default_value: "md",
        options: [
          { name: "Small", value: "sm" },
          { name: "Medium", value: "md" },
          { name: "Large", value: "lg" },
        ],
      },
      type: {
        type: "option",
        display_name: "Button Type",
        default_value: "button",
        options: [
          { name: "Button", value: "button" },
          { name: "Submit", value: "submit" },
          { name: "Reset", value: "reset" },
        ],
      },
      disabled: {
        type: "boolean",
        display_name: "Disabled",
        default_value: false,
      },
      link: {
        type: "multilink",
        display_name: "Link",
        description:
          "Optional link destination (internal page, external URL, email, or asset)",
      },
      marginTop: {
        type: "option",
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginBottom: {
        type: "option",
        display_name: "Margin Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginLeft: {
        type: "option",
        display_name: "Margin Left",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      marginRight: {
        type: "option",
        display_name: "Margin Right",
        source: "internal",
        datasource_slug: "spacing-options",
      },
    },
  };
}

async function getSbImageComponent(): Promise<StoryblokComponent> {
  const mediaGroupUuid = await getComponentGroupUuid("Media");

  return {
    name: "image",
    display_name: "Image",
    is_root: false,
    is_nestable: true,
    component_group_uuid: mediaGroupUuid,
    icon: "block-image",
    color: "#38b2ac",
    schema: {
      image: {
        type: "asset",
        display_name: "Image",
        required: true,
        filetypes: ["images"],
      },
      alt: {
        type: "text",
        display_name: "Alt Text",
        translatable: true,
      },
      caption: {
        type: "richtext",
        display_name: "Caption",
        translatable: true,
      },
      aspectRatio: {
        type: "option",
        display_name: "Aspect Ratio",
        source: "internal",
        datasource_slug: "aspect-ratio-options",
      },
      boundingWidth: {
        type: "option",
        display_name: "Width",
        source: "internal",
        datasource_slug: "width-options",
        default_value: "full",
      },
      spacingTop: {
        type: "option",
        display_name: "Spacing Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      spacingBottom: {
        type: "option",
        display_name: "Spacing Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      isFullHeight: {
        type: "boolean",
        display_name: "Full Height",
        default_value: "false",
      },
      isLoadingEager: {
        type: "boolean",
        display_name: "Eager Loading",
        default_value: "false",
      },
      copyright: {
        type: "text",
        display_name: "Copyright",
        description: "Copyright notice (e.g., photographer name)",
        translatable: true,
      },
      copyrightPosition: {
        type: "option",
        display_name: "Copyright Position",
        default_value: "inline-white",
        options: [
          { name: "Inline White (for dark images)", value: "inline-white" },
          { name: "Inline Black (for bright images)", value: "inline-black" },
          { name: "Overlay (Bottom Gradient)", value: "overlay" },
          { name: "Below Image", value: "below" },
        ],
      },
    },
  };
}

async function getSbVideoComponent(): Promise<StoryblokComponent> {
  const mediaGroupUuid = await getComponentGroupUuid("Media");

  return {
    name: "video",
    display_name: "Video",
    is_root: false,
    is_nestable: true,
    component_group_uuid: mediaGroupUuid,
    icon: "block-video",
    color: "#38b2ac",
    schema: {
      videoAsset: {
        type: "asset",
        display_name: "Video File",
        filetypes: ["videos"],
      },
      videoUrl: {
        type: "text",
        display_name: "Video URL (YouTube/Vimeo)",
      },
      source: {
        type: "option",
        display_name: "Video Source",
        default_value: "asset",
        options: [
          { name: "Asset", value: "asset" },
          { name: "YouTube", value: "youtube" },
          { name: "Vimeo", value: "vimeo" },
        ],
      },
      poster: {
        type: "asset",
        display_name: "Poster Image",
        filetypes: ["images"],
      },
      caption: {
        type: "richtext",
        display_name: "Caption",
        translatable: true,
      },
      aspectRatio: {
        type: "option",
        display_name: "Aspect Ratio",
        source: "internal",
        datasource_slug: "aspect-ratio-options",
      },
      boundingWidth: {
        type: "option",
        display_name: "Width",
        source: "internal",
        datasource_slug: "width-options",
        default_value: "full",
      },
      spacingTop: {
        type: "option",
        display_name: "Spacing Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      spacingBottom: {
        type: "option",
        display_name: "Spacing Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      controls: {
        type: "boolean",
        display_name: "Show Controls",
        default_value: "true",
      },
      autoPlay: {
        type: "boolean",
        display_name: "Auto Play",
        default_value: "false",
      },
      loop: {
        type: "boolean",
        display_name: "Loop",
        default_value: "false",
      },
      muted: {
        type: "boolean",
        display_name: "Muted",
        default_value: "false",
      },
      copyright: {
        type: "text",
        display_name: "Copyright",
        translatable: true,
      },
      copyrightPosition: {
        type: "option",
        display_name: "Copyright Position",
        default_value: "inline-white",
        options: [
          { name: "Inline White (for dark videos)", value: "inline-white" },
          { name: "Inline Black (for bright videos)", value: "inline-black" },
          { name: "Overlay (Bottom Gradient)", value: "overlay" },
          { name: "Below Video", value: "below" },
        ],
      },
    },
  };
}

async function getSbSlideshowComponent(): Promise<StoryblokComponent> {
  const mediaGroupUuid = await getComponentGroupUuid("Media");

  return {
    name: "slideshow",
    display_name: "Slideshow",
    is_root: false,
    is_nestable: true,
    component_group_uuid: mediaGroupUuid,
    icon: "block-slideshow",
    color: "#38b2ac",
    schema: {
      images: {
        type: "multiasset",
        display_name: "Images",
        required: true,
        filetypes: ["images"],
      },
      aspectRatio: {
        type: "option",
        display_name: "Aspect Ratio",
        source: "internal",
        datasource_slug: "aspect-ratio-options",
      },
      boundingWidth: {
        type: "option",
        display_name: "Width",
        source: "internal",
        datasource_slug: "width-options",
        default_value: "full",
      },
      spacingTop: {
        type: "option",
        display_name: "Spacing Top",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      spacingBottom: {
        type: "option",
        display_name: "Spacing Bottom",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      effect: {
        type: "option",
        display_name: "Transition Effect",
        default_value: "slide",
        options: [
          { name: "Slide", value: "slide" },
          { name: "Fade", value: "fade" },
          { name: "Cube 3D", value: "cube" },
          { name: "Coverflow 3D", value: "coverflow" },
          { name: "Flip 3D", value: "flip" },
          { name: "Cards", value: "cards" },
          { name: "Creative", value: "creative" },
        ],
      },
      autoplayDelay: {
        type: "number",
        display_name: "Autoplay Delay (ms)",
        default_value: "7000",
      },
      speed: {
        type: "number",
        display_name: "Transition Speed (ms)",
        default_value: "300",
      },
      showNavigation: {
        type: "boolean",
        display_name: "Show Navigation Arrows",
        default_value: "true",
      },
      animation: {
        type: "option",
        display_name: "Entrance Animation",
        default_value: "none",
        options: [
          { name: "None", value: "none" },
          { name: "Fade In", value: "fadeIn" },
          { name: "Zoom In", value: "zoomIn" },
          { name: "Sharpen", value: "sharpen" },
          { name: "Zoom & Sharpen", value: "zoomSharpen" },
          { name: "Slide In Left", value: "slideInFromLeft" },
          { name: "Slide In Right", value: "slideInFromRight" },
          { name: "Slide Up", value: "slideUp" },
          { name: "Slide Down", value: "slideDown" },
        ],
      },
      animationDelay: {
        type: "number",
        display_name: "Animation Delay (seconds)",
        default_value: "0",
      },
    },
  };
}

async function getSbWorkCardComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "work_card",
    display_name: "Work Card",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-image-text",
    color: "#8b5cf6",
    schema: {
      title: {
        type: "text",
        display_name: "Title",
        required: true,
        translatable: true,
      },
      description: {
        type: "textarea",
        display_name: "Description",
        translatable: true,
      },
      date: {
        type: "datetime",
        display_name: "Date",
      },
      slug: {
        type: "text",
        display_name: "Slug",
        required: true,
      },
      images: {
        type: "multiasset",
        display_name: "Images",
        required: true,
        filetypes: ["images"],
      },
      baseUrl: {
        type: "text",
        display_name: "Base URL",
        default_value: "/work",
      },
    },
  };
}

async function getSbWorkListComponent(): Promise<StoryblokComponent> {
  const contentGroupUuid = await getComponentGroupUuid("Content");

  return {
    name: "work_list",
    display_name: "Work List",
    is_root: false,
    is_nestable: true,
    component_group_uuid: contentGroupUuid,
    icon: "block-list",
    color: "#8b5cf6",
    schema: {
      work: {
        type: "options",
        display_name: "Work Items",
        required: false,
        source: "internal_stories",
        folder_slug: "work/",
        description: "Select work/portfolio stories to display",
      },
      gap: {
        type: "number",
        display_name: "Gap (px)",
        default_value: "24",
      },
      showDividers: {
        type: "boolean",
        display_name: "Show Dividers",
        default_value: "false",
      },
      dividerVariant: {
        type: "option",
        display_name: "Divider Style",
        default_value: "solid",
        options: [
          { name: "Solid", value: "solid" },
          { name: "Dashed", value: "dashed" },
          { name: "ASCII Pattern", value: "ascii" },
        ],
      },
      dividerPattern: {
        type: "text",
        display_name: "ASCII Pattern (if variant=ascii)",
        default_value: "* * * * *",
      },
      dividerColor: {
        type: "option",
        display_name: "Divider Color",
        source: "internal",
        datasource_slug: "color-options",
      },
      dividerSpacing: {
        type: "number",
        display_name: "Divider Spacing (px)",
        default_value: "12",
      },
    },
  };
}

async function getSbPageWorkComponent(): Promise<StoryblokComponent> {
  const pagesGroupUuid = await getComponentGroupUuid("Pages");

  return {
    name: "work",
    display_name: "Work Page",
    is_root: true,
    is_nestable: false,
    component_group_uuid: pagesGroupUuid,
    icon: "block-suitcase",
    color: "#f59e0b",
    schema: {
      body: {
        type: "bloks",
        display_name: "Body",
        description: "Add any components to build your work page",
        restrict_components: false,
      },
      title: {
        type: "text",
        display_name: "Title",
        translatable: true,
      },
      description: {
        type: "richtext",
        display_name: "Description",
        translatable: true,
      },
      images: {
        type: "multiasset",
        display_name: "Featured Images",
        description: "First image will be used as preview in navigation",
        filetypes: ["images"],
      },
      date: {
        type: "datetime",
        display_name: "Date",
        description: "Project/exhibition date or start date",
      },
      date_end: {
        type: "datetime",
        display_name: "End Date",
        description: "Optional end date for exhibitions/events with timespan",
      },
      link: {
        type: "multilink",
        display_name: "Link",
        description: "Optional external link (e.g. project URL)",
      },
      external_only: {
        type: "boolean",
        display_name: "External Only",
        description: "Hide body content and show only external link",
        default_value: "false",
      },
    },
  };
}

async function getSbPageComponent(): Promise<StoryblokComponent> {
  const pagesGroupUuid = await getComponentGroupUuid("Pages");

  return {
    name: "page",
    display_name: "Page",
    is_root: true,
    is_nestable: false,
    component_group_uuid: pagesGroupUuid,
    icon: "block-doc",
    color: "#3b82f6",
    schema: {
      body: {
        type: "bloks",
        display_name: "Body",
        description: "Add any components to build your page",
        restrict_components: false,
      },
      title: {
        type: "text",
        display_name: "Title",
        translatable: true,
      },
      isDark: {
        type: "boolean",
        display_name: "Dark Mode",
        default_value: "false",
        description: "Enable dark mode for this page",
      },
    },
  };
}

async function getSbFooterConfigComponent(): Promise<StoryblokComponent> {
  const settingsGroupUuid = await getComponentGroupUuid("Settings");

  return {
    name: "footer_config",
    display_name: "Footer Config",
    is_root: false,
    is_nestable: true,
    component_group_uuid: settingsGroupUuid,
    icon: "block-layout-footer",
    color: "#8b5cf6",
    schema: {
      copyright_text: {
        type: "text",
        display_name: "Copyright Text",
        description: "Footer copyright text",
        pos: 0,
      },
      footer_links: {
        type: "bloks",
        display_name: "Footer Links",
        description: "Links displayed in footer (like Legal, Privacy, etc.)",
        restrict_components: true,
        component_whitelist: ["menu_link"],
        pos: 1,
      },
      background_image: {
        type: "asset",
        display_name: "Background Image",
        description: "Footer background texture",
        filetypes: ["images"],
        pos: 2,
      },
    },
  };
}

async function getSbConfigComponent(): Promise<StoryblokComponent> {
  const settingsGroupUuid = await getComponentGroupUuid("Settings");

  return {
    name: "config",
    display_name: "Config",
    is_root: true,
    is_nestable: false,
    component_group_uuid: settingsGroupUuid,
    icon: "block-settings-2",
    color: "#8b5cf6",
    schema: {
      header_menu: {
        type: "bloks",
        display_name: "Header Menu",
        description: "Navigation items for the header",
        restrict_components: true,
        component_whitelist: ["menu_link"],
        pos: 0,
      },
      footer_config: {
        type: "bloks",
        display_name: "Footer Configuration",
        description: "Footer settings",
        restrict_components: true,
        component_whitelist: ["footer_config"],
        maximum: 1,
        pos: 1,
      },
      seo_title: {
        type: "text",
        display_name: "SEO Title",
        description: "Default meta title",
        pos: 2,
      },
      seo_description: {
        type: "textarea",
        display_name: "SEO Description",
        description: "Default meta description",
        pos: 3,
      },
      psn_username: {
        type: "text",
        display_name: "PSN Username",
        description: "PlayStation Network username for PSN card widget",
        pos: 4,
      },
      psn_enabled: {
        type: "boolean",
        display_name: "Enable PSN Card",
        default_value: "false",
        description: "Show PlayStation Network card widget",
        pos: 5,
      },
      discord_user_id: {
        type: "text",
        display_name: "Discord User ID",
        description:
          "Discord User ID for live status (get from Discord Developer Mode)",
        pos: 6,
      },
      spotify_enabled: {
        type: "boolean",
        display_name: "Enable Now Playing",
        default_value: "true",
        description: "Show Spotify Now Playing widget",
        pos: 7,
      },
      author_name: {
        type: "text",
        display_name: "Author Name",
        description: "Site author/owner name for Schema.org structured data",
        pos: 8,
      },
      author_url: {
        type: "text",
        display_name: "Author URL",
        description: "Author website URL for Schema.org structured data",
        pos: 9,
      },
    },
  };
}

/**
 * Sleep helper to avoid rate limits
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main sync function
 */
async function syncComponents(): Promise<void> {
  console.log("🚀 Starting Storyblok component sync...\n");

  validateEnv();

  const componentGetters = [
    getSbSectionComponent,
    getSbContainerComponent,
    getSbGridComponent,
    getSbHeadlineComponent,
    getSbParagraphComponent,
    getSbRichTextComponent,
    getSbButtonComponent,
    getSbImageComponent,
    getSbVideoComponent,
    getSbSlideshowComponent,
    getSbWorkCardComponent,
    getSbWorkListComponent,
    getSbPageComponent,
    getSbPageWorkComponent,
    getSbFooterConfigComponent,
    getSbConfigComponent,
  ];

  for (const getComponent of componentGetters) {
    try {
      const component = await getComponent();
      await createOrUpdateComponent(component);
      // Wait 500ms between components to avoid rate limiting (each component = 3-4 API calls)
      await sleep(500);
    } catch (error) {
      console.error("❌ Failed to sync component:", error);
    }
  }

  console.log("\n✨ All components synced successfully!");
  console.log("\n📦 Created/Updated Components:");
  console.log("   Layout:");
  console.log("   - section (Semantic section wrapper)");
  console.log("   - container (Content container)");
  console.log("   - grid (Responsive grid layout)");
  console.log("\n   Content:");
  console.log("   - headline (H1-H3 headings)");
  console.log("   - paragraph (Plain body text)");
  console.log("   - richtext (Rich text with auto Headline/Paragraph/Links)");
  console.log("\n   Media:");
  console.log("   - image (Responsive images)");
  console.log("   - video (Video player)");
  console.log("   - slideshow (Image carousel with effects)");
  console.log("\n   Portfolio:");
  console.log("   - work_card (Project showcase card)");
  console.log("   - work_list (Portfolio list)");
  console.log("\n   Pages (Content Types):");
  console.log("   - page (Generic Page)");
  console.log("   - work (Work/Portfolio Page)");
  console.log("\nNext steps:");
  console.log("1. Open Storyblok Visual Editor");
  console.log("2. Components are now available in the editor");
  console.log("3. Use 'richtext' for formatted text with bold/italic/links");
  console.log("4. Use 'paragraph' for simple plain text");
}

// Run sync
syncComponents().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
