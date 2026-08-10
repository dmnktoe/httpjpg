#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { banner, fail, outro, warn } from "@httpjpg/terminal";

import { validateEnv } from "../src/index";
import { fetchComponentIds, upsertBlock } from "./lib/block";
import { allBlocks } from "./lib/schema";
import { validateLocalSchema } from "./lib/validate";

async function syncComponents(): Promise<void> {
  banner("storyblok · components");
  validateEnv();

  const blocks = allBlocks();
  const validation = validateLocalSchema(blocks);
  for (const issue of validation.issues) {
    warn(`${issue.entity} · ${issue.code} · ${issue.message}`);
  }
  if (!validation.ok) {
    throw new Error("schema validation failed — nothing was pushed");
  }

  const existingIds = await fetchComponentIds();
  const failed: string[] = [];
  for (const def of blocks) {
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
