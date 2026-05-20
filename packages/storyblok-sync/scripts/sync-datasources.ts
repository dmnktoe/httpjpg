#!/usr/bin/env tsx

/**
 * Sync Storyblok datasources from `@httpjpg/storyblok-utils` `CMS_OPTIONS`.
 *
 * `value` of every entry is the canonical token a Storyblok-UI wrapper
 * consumes at runtime. Add new options to `CMS_OPTIONS`, run this script,
 * and a Panda rebuild — the new value is then available everywhere.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local") });

import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { spacing } from "@httpjpg/tokens";

import { type Datasource, type DatasourceEntry, storyblokRequest, validateEnv } from "../src/index";

async function getDatasource(slug: string): Promise<{ id: number } | null> {
  try {
    const response = await storyblokRequest<{
      datasources: Array<{ id: number; slug: string }>;
    }>("/datasources?per_page=100");
    return response.datasources?.find((ds) => ds.slug === slug) || null;
  } catch {
    return null;
  }
}

async function upsertDatasource(datasource: Datasource, entries: DatasourceEntry[]): Promise<void> {
  const existing = await getDatasource(datasource.slug);

  if (existing) {
    console.log(`📝 ${datasource.name}`);
    await storyblokRequest(`/datasources/${existing.id}`, "PUT", {
      datasource: { name: datasource.name, slug: datasource.slug },
    });

    const existingEntriesResponse = await storyblokRequest<{
      datasource_entries: Array<{ id: number; name: string }>;
    }>(`/datasource_entries?datasource_id=${existing.id}&per_page=100`);
    const existingEntries = existingEntriesResponse.datasource_entries || [];

    for (const entry of entries) {
      const found = existingEntries.find((e) => e.name === entry.name);
      if (found) {
        await storyblokRequest(`/datasource_entries/${found.id}`, "PUT", {
          datasource_entry: { name: entry.name, value: entry.value },
        });
      } else {
        await storyblokRequest("/datasource_entries", "POST", {
          datasource_entry: {
            datasource_id: existing.id,
            name: entry.name,
            value: entry.value,
          },
        });
      }
      await sleep(180);
    }

    for (const entry of existingEntries.filter((e) => !entries.some((n) => n.name === e.name))) {
      await storyblokRequest(`/datasource_entries/${entry.id}`, "DELETE");
    }
    return;
  }

  console.log(`✨ ${datasource.name}`);
  const response = await storyblokRequest<{ datasource: { id: number } }>("/datasources", "POST", {
    datasource,
  });
  const id = response.datasource.id;
  for (const entry of entries) {
    await storyblokRequest("/datasource_entries", "POST", {
      datasource_entry: {
        datasource_id: id,
        name: entry.name,
        value: entry.value,
      },
    });
    await sleep(180);
  }
}

type DatasourceWithEntries = {
  datasource: Datasource;
  entries: DatasourceEntry[];
};

function spacingDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Spacing Options", slug: "spacing-options" },
    entries: CMS_OPTIONS.spacing
      .slice()
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        name: `${key} (${spacing[key as unknown as keyof typeof spacing]})`,
        value: key,
      })),
  };
}

function colorDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Color Options", slug: "color-options" },
    entries: CMS_OPTIONS.colorEntries.slice(),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function syncDatasources(): Promise<void> {
  console.log("🚀 Syncing Storyblok datasources\n");
  validateEnv();

  const datasources = [spacingDs(), colorDs()];

  for (const { datasource, entries } of datasources) {
    try {
      await upsertDatasource(datasource, entries);
      console.log(`✅ ${datasource.name} (${entries.length} entries)`);
      await sleep(500);
    } catch (error) {
      console.error(`❌ ${datasource.name}:`, error);
      process.exit(1);
    }
  }

  console.log("\n✨ Datasource sync complete");
}

syncDatasources().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
