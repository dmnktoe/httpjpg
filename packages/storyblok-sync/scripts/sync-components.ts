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
        datasource_slug: "background-color-options",
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
        display_name: "Width",
        default_value: "container",
        options: [
          { name: "Full Width", value: "full" },
          { name: "Container", value: "container" },
          { name: "Narrow", value: "narrow" },
        ],
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
        datasource_slug: "background-color-options",
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
        datasource_slug: "text-color-options",
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
        datasource_slug: "text-color-options",
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
        options: [
          { name: "Bottom Left", value: "bottom-left" },
          { name: "Bottom Right", value: "bottom-right" },
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
      works: {
        type: "bloks",
        display_name: "Works",
        required: true,
        restrict_components: true,
        component_whitelist: ["work_card"],
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
        datasource_slug: "text-color-options",
      },
      dividerSpacing: {
        type: "number",
        display_name: "Divider Spacing (px)",
        default_value: "12",
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
    getSbImageComponent,
    getSbVideoComponent,
    getSbSlideshowComponent,
    getSbWorkCardComponent,
    getSbWorkListComponent,
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
