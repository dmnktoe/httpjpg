#!/usr/bin/env tsx

/**
 * Sync Design Tokens to Storyblok Datasources
 *
 * This script automatically creates and updates Storyblok datasources
 * from your design tokens, ensuring the Visual Editor options always
 * match your codebase.
 *
 * Usage:
 *   pnpm --filter @httpjpg/storyblok-sync sync:datasources
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

// Import design tokens dynamically
import { colors, spacing, typography } from "@httpjpg/tokens";
import {
  type Datasource,
  type DatasourceEntry,
  storyblokRequest,
  validateEnv,
} from "../src/index";

/**
 * Get existing datasource by slug
 */
async function getDatasource(slug: string): Promise<{ id: number } | null> {
  try {
    const response = await storyblokRequest<{
      datasources: Array<{ id: number; slug: string }>;
    }>("/datasources?per_page=100");
    const datasource = response.datasources?.find((ds) => ds.slug === slug);
    return datasource || null;
  } catch {
    return null;
  }
}

/**
 * Create or update a datasource
 */
async function createOrUpdateDatasource(
  datasource: Datasource,
  entries: DatasourceEntry[],
): Promise<void> {
  const existing = await getDatasource(datasource.slug);

  if (existing) {
    console.log(`📝 Updating datasource: ${datasource.name}`);

    // Update datasource metadata
    await storyblokRequest(`/datasources/${existing.id}`, "PUT", {
      datasource: {
        name: datasource.name,
        slug: datasource.slug,
      },
    });

    // Get existing entries
    const existingEntriesResponse = await storyblokRequest<any>(
      `/datasource_entries?datasource_id=${existing.id}&per_page=100`,
    );
    const existingEntries = existingEntriesResponse.datasource_entries || [];

    // Update or create entries
    for (const entry of entries) {
      const existingEntry = existingEntries.find(
        (e: any) => e.name === entry.name,
      );

      if (existingEntry) {
        // Update existing entry
        await storyblokRequest(
          `/datasource_entries/${existingEntry.id}`,
          "PUT",
          {
            datasource_entry: {
              name: entry.name,
              value: entry.value,
            },
          },
        );
      } else {
        // Create new entry
        await storyblokRequest("/datasource_entries", "POST", {
          datasource_entry: {
            datasource_id: existing.id,
            name: entry.name,
            value: entry.value,
          },
        });
      }
      // Wait 180ms between entry operations (max ~5.5 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 180));
    }

    // Delete entries that no longer exist in tokens
    const entriesToDelete = existingEntries.filter(
      (existing: any) => !entries.some((e) => e.name === existing.name),
    );

    for (const entry of entriesToDelete) {
      await storyblokRequest(`/datasource_entries/${entry.id}`, "DELETE");
    }
  } else {
    console.log(`✨ Creating datasource: ${datasource.name}`);

    // Create datasource
    const response = await storyblokRequest<any>("/datasources", "POST", {
      datasource,
    });

    const datasourceId = response.datasource.id;

    // Create entries
    for (const entry of entries) {
      await storyblokRequest("/datasource_entries", "POST", {
        datasource_entry: {
          datasource_id: datasourceId,
          name: entry.name,
          value: entry.value,
        },
      });
      // Wait 180ms between entry operations (max ~5.5 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
  }
}

/**
 * Generate spacing options datasource dynamically from tokens
 */
function generateSpacingDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  // Dynamically generate from spacing tokens
  const spacingEntries = Object.entries(spacing)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, value]) => ({
      name: `${key} (${value})`,
      value: key,
    }));

  return {
    datasource: {
      name: "Spacing Options",
      slug: "spacing-options",
    },
    entries: spacingEntries,
  };
}

/**
 * Generate unified color options datasource for both text and backgrounds
 * Uses actual hex values for runtime compatibility
 */
function generateColorDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "White", value: colors.white },
    { name: "Black", value: colors.black },
    { name: "Light Gray", value: colors.neutral[50] },
    { name: "Gray", value: colors.neutral[100] },
    { name: "Gray Medium", value: colors.neutral[500] },
    { name: "Dark Gray", value: colors.neutral[800] },
    { name: "Primary", value: colors.primary[500] },
    { name: "Accent", value: colors.accent[500] },
  ];

  return {
    datasource: {
      name: "Color Options",
      slug: "color-options",
    },
    entries,
  };
}

/**
 * Generate width options datasource
 */
function generateWidthDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Small (640px)", value: "sm" },
    { name: "Medium (768px)", value: "md" },
    { name: "Large (1024px)", value: "lg" },
    { name: "XL (1280px)", value: "xl" },
    { name: "2XL (1536px)", value: "2xl" },
    { name: "Fluid (100%)", value: "fluid" },
  ];

  return {
    datasource: {
      name: "Width Options",
      slug: "width-options",
    },
    entries,
  };
}

/**
 * Generate aspect ratio options datasource
 */
function generateAspectRatioDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "16:9 (Landscape)", value: "16/9" },
    { name: "4:3 (Standard)", value: "4/3" },
    { name: "1:1 (Square)", value: "1/1" },
    { name: "3:4 (Portrait)", value: "3/4" },
    { name: "9:16 (Vertical)", value: "9/16" },
    { name: "21:9 (Ultrawide)", value: "21/9" },
  ];

  return {
    datasource: {
      name: "Aspect Ratio Options",
      slug: "aspect-ratio-options",
    },
    entries,
  };
}

/**
 * Generate prose max width datasource
 */
function generateProseMaxWidthDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "None (Full width)", value: "none" },
    { name: "Narrow (45ch)", value: "45ch" },
    { name: "Readable (65ch)", value: "65ch" },
    { name: "Wide (80ch)", value: "80ch" },
    { name: "Extra Wide (100ch)", value: "100ch" },
  ];

  return {
    datasource: {
      name: "Prose Max Width Options",
      slug: "prose-max-width-options",
    },
    entries,
  };
}

/**
 * Generate grid columns datasource
 */
function generateGridColumnsDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "1 Column", value: "1" },
    { name: "2 Columns", value: "2" },
    { name: "3 Columns", value: "3" },
    { name: "4 Columns", value: "4" },
    { name: "5 Columns", value: "5" },
    { name: "6 Columns", value: "6" },
    { name: "Auto Fit", value: "auto-fit" },
  ];

  return {
    datasource: {
      name: "Grid Columns",
      slug: "grid-columns",
    },
    entries,
  };
}

/**
 * Generate font family datasource
 */
function generateFontFamilyDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Sans (Body)", value: "sans" },
    { name: "Headline (Impact)", value: "headline" },
    { name: "Accent (Script)", value: "accent" },
    { name: "Mono (Code)", value: "mono" },
  ];

  return {
    datasource: {
      name: "Font Family",
      slug: "font-family",
    },
    entries,
  };
}

/**
 * Generate font size datasource dynamically from typography tokens
 */
function generateFontSizeDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  // Dynamically generate from typography.fontSize tokens
  const fontSizeEntries = Object.entries(typography.fontSize).map(
    ([key, value]) => ({
      name: `${key.toUpperCase()} (${value})`,
      value: key,
    }),
  );

  return {
    datasource: {
      name: "Font Size",
      slug: "font-size",
    },
    entries: fontSizeEntries,
  };
}

/**
 * Generate font weight datasource dynamically from typography tokens
 */
function generateFontWeightDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  // Dynamically generate from typography.fontWeight tokens
  const fontWeightEntries = Object.entries(typography.fontWeight).map(
    ([key, value]) => ({
      name: `${key.charAt(0).toUpperCase() + key.slice(1)} (${value})`,
      value: key,
    }),
  );

  return {
    datasource: {
      name: "Font Weight",
      slug: "font-weight",
    },
    entries: fontWeightEntries,
  };
}

/**
 * Generate text color datasource dynamically from color tokens
 */
/**
 * Generate text color options datasource
 * Uses actual hex values for runtime compatibility
 */
function _generateTextColorDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Black", value: colors.black },
    { name: "White", value: colors.white },
    // Generate from color tokens
    { name: "Gray Light", value: colors.neutral[300] },
    { name: "Gray", value: colors.neutral[500] },
    { name: "Gray Dark", value: colors.neutral[700] },
    { name: "Primary", value: colors.primary[500] },
    { name: "Accent (Orange)", value: colors.accent[500] },
  ];

  return {
    datasource: {
      name: "Text Color Options",
      slug: "text-color-options",
    },
    entries,
  };
}

/**
 * Generate animation duration datasource
 */
function _generateAnimationDurationDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Instant", value: "0" },
    { name: "Fast (150ms)", value: "fast" },
    { name: "Normal (300ms)", value: "normal" },
    { name: "Slow (500ms)", value: "slow" },
    { name: "Very Slow (1s)", value: "slower" },
  ];

  return {
    datasource: {
      name: "Animation Duration",
      slug: "animation-duration",
    },
    entries,
  };
}

/**
 * Generate animation type datasource
 * Based on AnimationType from @httpjpg/ui AnimateInView component
 */
function generateAnimationTypeDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "None (No Animation)", value: "none" },
    { name: "Fade In", value: "fadeIn" },
    { name: "Zoom In", value: "zoomIn" },
    { name: "Zoom Sharpen", value: "zoomSharpen" },
    { name: "Sharpen", value: "sharpen" },
    { name: "Slide In From Left", value: "slideInFromLeft" },
    { name: "Slide In From Right", value: "slideInFromRight" },
    { name: "Slide Up", value: "slideUp" },
    { name: "Slide Down", value: "slideDown" },
  ];

  return {
    datasource: {
      name: "Animation Type",
      slug: "animation-type",
    },
    entries,
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
async function syncDatasources(): Promise<void> {
  console.log("🚀 Starting Storyblok datasource sync...\n");

  validateEnv();

  const datasources = [
    // Spacing & Layout (3)
    generateSpacingDatasource(),
    generateWidthDatasource(),
    generateAspectRatioDatasource(),

    // Colors (1 unified)
    generateColorDatasource(),

    // Typography (3)
    generateFontFamilyDatasource(),
    generateFontSizeDatasource(),
    generateFontWeightDatasource(),

    // Content & Animation (3)
    generateGridColumnsDatasource(),
    generateProseMaxWidthDatasource(),
    generateAnimationTypeDatasource(),
  ];

  for (const { datasource, entries } of datasources) {
    try {
      await createOrUpdateDatasource(datasource, entries);
      console.log(`✅ ${datasource.name} synced (${entries.length} entries)\n`);
      // Wait 500ms between datasources to avoid rate limiting (max 2 req/sec to stay safe)
      await sleep(500);
    } catch (error) {
      console.error(`❌ Failed to sync ${datasource.name}:`, error);
      process.exit(1);
    }
  }

  console.log("✨ All datasources synced successfully!");
  console.log("\n📦 Created/Updated Datasources:");
  console.log("   Spacing & Layout:");
  console.log("   - spacing-options (padding/margin)");
  console.log("   - width-options (container widths)");
  console.log("   - grid-columns (grid layouts)");
  console.log("   - aspect-ratio-options (media)");
  console.log("\n   Colors:");
  console.log("   - background-color-options");
  console.log("   - text-color-options");
  console.log("\n   Typography:");
  console.log("   - font-family");
  console.log("   - font-size");
  console.log("   - font-weight");
  console.log("\n   Animations:");
  console.log("   - animation-duration");
  console.log("   - animation-easing");
  console.log("\nNext steps:");
  console.log("1. Open Storyblok Visual Editor");
  console.log("2. Edit component schemas (Single-Option fields)");
  console.log("3. Set 'Source: Datasource' and select from list above");
}

// Run sync
syncDatasources().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
