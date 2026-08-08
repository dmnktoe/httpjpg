#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { banner, done, fail, outro, step } from "@httpjpg/terminal";
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
    step(datasource.name);
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
    }

    for (const entry of existingEntries.filter((e) => !entries.some((n) => n.name === e.name))) {
      await storyblokRequest(`/datasource_entries/${entry.id}`, "DELETE");
    }
    return;
  }

  done(datasource.name);
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
  }
}

interface DatasourceWithEntries {
  datasource: Datasource;
  entries: DatasourceEntry[];
}

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

async function syncDatasources(): Promise<void> {
  banner("storyblok · datasources");
  validateEnv();

  const datasources = [spacingDs(), colorDs()];

  for (const { datasource, entries } of datasources) {
    try {
      await upsertDatasource(datasource, entries);
      done(`${datasource.name} · ${entries.length} entries`);
    } catch (error) {
      fail(`${datasource.name} · ${error}`);
    }
  }

  outro("datasource sync complete");
}

syncDatasources().catch((error) => {
  fail(`sync failed · ${error}`);
});
