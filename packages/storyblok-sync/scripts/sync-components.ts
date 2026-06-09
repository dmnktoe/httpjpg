#!/usr/bin/env tsx

/**
 * Sync Storyblok component schemas, declaratively.
 *
 * Block schemas live in `./blocks/<group>.ts`. Field builders + the unified
 * Spacing tab live in `./lib`. Datasource slugs map 1:1 to entries generated
 * by `sync-datasources.ts` from `@httpjpg/storyblok-utils` `CMS_OPTIONS`.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local") });

import { validateEnv } from "../src/index";
import { contentBlocks } from "./blocks/content";
import { layoutBlocks } from "./blocks/layout";
import { mediaBlocks } from "./blocks/media";
import { pageBlocks } from "./blocks/pages";
import { settingsBlocks } from "./blocks/settings";
import { type BlockDef, fetchComponentIds, upsertBlock } from "./lib/block";

const BLOCKS: BlockDef[] = [
  ...layoutBlocks,
  ...contentBlocks,
  ...mediaBlocks,
  ...pageBlocks,
  ...settingsBlocks,
];

async function syncComponents(): Promise<void> {
  console.log("Syncing Storyblok components\n");
  validateEnv();
  const existingIds = await fetchComponentIds();
  for (const def of BLOCKS) {
    try {
      await upsertBlock(def, existingIds);
    } catch (error) {
      console.error(`${def.name}:`, error);
    }
  }
  console.log("\nComponent sync complete");
}

syncComponents().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
