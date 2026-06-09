#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local") });

import { storyblokRequest, validateEnv } from "../src/index";

interface ComponentGroup {
  id: number;
  name: string;
  uuid: string;
}

const CANONICAL_GROUPS = ["Layout", "Content", "Media", "Pages", "Settings"];

async function cleanupDuplicateGroups() {
  validateEnv();

  const response = await storyblokRequest<{
    component_groups: ComponentGroup[];
  }>("/component_groups");
  const allGroups = response.component_groups || [];

  const toDelete = allGroups.filter((g) => !CANONICAL_GROUPS.includes(g.name));
  if (toDelete.length === 0) {
    console.log("No duplicate groups found.");
    return;
  }

  console.log(`Deleting ${toDelete.length} non-canonical groups:`);
  for (const group of toDelete) {
    console.log(`  - ${group.name} (${group.id})`);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));

  for (const group of toDelete) {
    try {
      await storyblokRequest(`/component_groups/${group.id}`, "DELETE");
      console.log(`deleted ${group.name}`);
    } catch (error) {
      console.error(`${group.name}:`, error);
    }
  }
}

cleanupDuplicateGroups().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
