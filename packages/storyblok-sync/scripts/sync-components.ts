#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { banner, fail, outro, warn } from "@httpjpg/terminal";

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
  banner("storyblok · components");
  validateEnv();
  const existingIds = await fetchComponentIds();
  const failed: string[] = [];
  for (const def of BLOCKS) {
    try {
      await upsertBlock(def, existingIds);
    } catch (error) {
      warn(`${def.name} · ${error}`);
      failed.push(def.name);
    }
  }
  if (failed.length > 0) {
    throw new Error(`${failed.length} component(s) failed to sync: ${failed.join(", ")}`);
  }
  outro("component sync complete");
}

syncComponents().catch((error) => {
  fail(`sync failed · ${error}`);
});
