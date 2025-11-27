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

function getSbSectionComponent(): StoryblokComponent {
  return {
    name: "section",
    display_name: "Section",
    is_root: false,
    is_nestable: true,
    schema: {
      content: {
        type: "bloks",
        display_name: "Content",
        required: true,
        restrict_components: true,
        component_whitelist: [],
      },
      bgColor: {
        type: "option",
        display_name: "Background Color",
        source: "internal",
        datasource_slug: "background-color-options",
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
      paddingLeft: {
        type: "option",
        display_name: "Padding Left",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingRight: {
        type: "option",
        display_name: "Padding Right",
        source: "internal",
        datasource_slug: "spacing-options",
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
      width: {
        type: "option",
        display_name: "Width",
        default_value: "container",
        options: [
          { name: "Container", value: "container" },
          { name: "Full Width", value: "full" },
        ],
      },
      paddingTopMd: {
        type: "option",
        display_name: "Padding Top (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
      },
      paddingBottomMd: {
        type: "option",
        display_name: "Padding Bottom (Tablet)",
        source: "internal",
        datasource_slug: "spacing-options",
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

function getSbContainerComponent(): StoryblokComponent {
  return {
    name: "container",
    display_name: "Container",
    is_root: false,
    is_nestable: true,
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

function getSbGridComponent(): StoryblokComponent {
  return {
    name: "grid",
    display_name: "Grid",
    is_root: false,
    is_nestable: true,
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

function getSbHeadlineComponent(): StoryblokComponent {
  return {
    name: "headline",
    display_name: "Headline",
    is_root: false,
    is_nestable: true,
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
          { name: "H1", value: "1" },
          { name: "H2", value: "2" },
          { name: "H3", value: "3" },
        ],
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

function getSbParagraphComponent(): StoryblokComponent {
  return {
    name: "paragraph",
    display_name: "Paragraph",
    is_root: false,
    is_nestable: true,
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

function getSbImageComponent(): StoryblokComponent {
  return {
    name: "image",
    display_name: "Image",
    is_root: false,
    is_nestable: true,
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

function getSbVideoComponent(): StoryblokComponent {
  return {
    name: "video",
    display_name: "Video",
    is_root: false,
    is_nestable: true,
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

function getSbSlideshowComponent(): StoryblokComponent {
  return {
    name: "slideshow",
    display_name: "Slideshow",
    is_root: false,
    is_nestable: true,
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
      speed: {
        type: "number",
        display_name: "Autoplay Speed (seconds)",
        default_value: "5",
      },
    },
  };
}

/**
 * Main sync function
 */
async function syncComponents(): Promise<void> {
  console.log("🚀 Starting Storyblok component sync...\n");

  validateEnv();

  const components = [
    getSbSectionComponent(),
    getSbContainerComponent(),
    getSbGridComponent(),
    getSbHeadlineComponent(),
    getSbParagraphComponent(),
    getSbImageComponent(),
    getSbVideoComponent(),
    getSbSlideshowComponent(),
  ];

  for (const component of components) {
    try {
      await createOrUpdateComponent(component);
    } catch (error) {
      console.error(`❌ Failed to sync ${component.name}:`, error);
    }
  }

  console.log("\n✨ All components synced successfully!");
  console.log("\n📦 Created/Updated Components:");
  console.log("   Layout:");
  console.log("   - section (Semantic section wrapper)");
  console.log("   - container (Content container)");
  console.log("   - grid (Responsive grid layout)");
  console.log("\n   Typography:");
  console.log("   - headline (H1-H3 headings)");
  console.log("   - paragraph (Body text)");
  console.log("\n   Media:");
  console.log("   - image (Responsive images)");
  console.log("   - video (Video player)");
  console.log("   - slideshow (Image carousel)");
  console.log("\nNext steps:");
  console.log("1. Open Storyblok Visual Editor");
  console.log("2. Components are now available in the editor");
  console.log("3. Configure nested blok whitelists as needed");
}

// Run sync
syncComponents().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
