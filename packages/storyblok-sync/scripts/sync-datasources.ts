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
    }
  }
}

/**
 * Generate spacing options datasource from tokens
 */
function generateSpacingDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "None", value: "0" },
    { name: "XS", value: "2" },
    { name: "Small", value: "4" },
    { name: "Medium", value: "8" },
    { name: "Large", value: "16" },
    { name: "XL", value: "24" },
    { name: "2XL", value: "32" },
    { name: "3XL", value: "40" },
    { name: "4XL", value: "48" },
  ];

  return {
    datasource: {
      name: "Spacing Options",
      slug: "spacing-options",
    },
    entries,
  };
}

/**
 * Generate color options datasource from tokens
 */
function generateColorDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "White", value: "white" },
    { name: "Black", value: "black" },
    { name: "Light Gray", value: "neutral.50" },
    { name: "Gray", value: "neutral.100" },
    { name: "Dark Gray", value: "neutral.800" },
    { name: "Primary", value: "primary.500" },
    { name: "Accent", value: "accent.500" },
  ];

  return {
    datasource: {
      name: "Background Color Options",
      slug: "background-color-options",
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
    { name: "Full Width", value: "full" },
    { name: "Container", value: "container" },
    { name: "Narrow", value: "narrow" },
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
 * Generate font size datasource
 */
function generateFontSizeDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Small (12px)", value: "sm" },
    { name: "Medium (14px)", value: "md" },
    { name: "Base (16px)", value: "base" },
    { name: "Large (16px)", value: "lg" },
    { name: "XL (18px)", value: "xl" },
  ];

  return {
    datasource: {
      name: "Font Size",
      slug: "font-size",
    },
    entries,
  };
}

/**
 * Generate font weight datasource
 */
function generateFontWeightDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Light (300)", value: "light" },
    { name: "Normal (400)", value: "normal" },
    { name: "Medium (500)", value: "medium" },
    { name: "Semibold (600)", value: "semibold" },
    { name: "Bold (700)", value: "bold" },
    { name: "Black (900)", value: "black" },
  ];

  return {
    datasource: {
      name: "Font Weight",
      slug: "font-weight",
    },
    entries,
  };
}

/**
 * Generate text color datasource
 */
function generateTextColorDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Black", value: "black" },
    { name: "White", value: "white" },
    { name: "Gray", value: "neutral.500" },
    { name: "Dark Gray", value: "neutral.700" },
    { name: "Light Gray", value: "neutral.300" },
    { name: "Primary", value: "primary.500" },
    { name: "Accent", value: "accent.500" },
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
function generateAnimationDurationDatasource(): {
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
 * Generate animation easing datasource
 */
function generateAnimationEasingDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  const entries: DatasourceEntry[] = [
    { name: "Linear", value: "linear" },
    { name: "Ease", value: "ease" },
    { name: "Ease In", value: "ease-in" },
    { name: "Ease Out", value: "ease-out" },
    { name: "Ease In Out", value: "ease-in-out" },
  ];

  return {
    datasource: {
      name: "Animation Easing",
      slug: "animation-easing",
    },
    entries,
  };
}

/**
 * Main sync function
 */
async function syncDatasources(): Promise<void> {
  console.log("🚀 Starting Storyblok datasource sync...\n");

  validateEnv();

  const datasources = [
    // Spacing & Layout
    generateSpacingDatasource(),
    generateWidthDatasource(),
    generateGridColumnsDatasource(),
    generateAspectRatioDatasource(),

    // Colors
    generateColorDatasource(),
    generateTextColorDatasource(),

    // Typography
    generateFontFamilyDatasource(),
    generateFontSizeDatasource(),
    generateFontWeightDatasource(),

    // Animations
    generateAnimationDurationDatasource(),
    generateAnimationEasingDatasource(),
  ];

  for (const { datasource, entries } of datasources) {
    try {
      await createOrUpdateDatasource(datasource, entries);
      console.log(`✅ ${datasource.name} synced (${entries.length} entries)\n`);
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
