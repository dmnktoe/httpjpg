#!/usr/bin/env tsx

/**
 * Cleanup Duplicate Component Groups
 *
 * Removes duplicate/lowercase component groups from Storyblok.
 * Keeps only the canonical groups: Layout, Content, Media, Pages, Settings
 */

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

// Canonical groups we want to keep
const CANONICAL_GROUPS = ["Layout", "Content", "Media", "Pages", "Settings"];

async function cleanupDuplicateGroups() {
  console.log("🧹 Cleaning up duplicate component groups...\n");

  validateEnv();

  // Get all groups
  const response = await storyblokRequest<{
    component_groups: ComponentGroup[];
  }>("/component_groups");

  const allGroups = response.component_groups || [];

  console.log("📋 All groups found:");
  for (const group of allGroups) {
    const isCanonical = CANONICAL_GROUPS.includes(group.name);
    console.log(
      `  ${isCanonical ? "✅" : "❌"} ${group.name} (ID: ${group.id})`,
    );
  }

  // Find groups to delete (not in canonical list)
  const groupsToDelete = allGroups.filter(
    (g) => !CANONICAL_GROUPS.includes(g.name),
  );

  if (groupsToDelete.length === 0) {
    console.log("\n✨ No duplicate groups found!");
    return;
  }

  console.log(`\n🗑️  Found ${groupsToDelete.length} groups to delete:`);
  for (const group of groupsToDelete) {
    console.log(`  - ${group.name} (ID: ${group.id})`);
  }

  // Ask for confirmation
  console.log("\n⚠️  This will delete these groups permanently!");
  console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Delete groups
  for (const group of groupsToDelete) {
    try {
      console.log(`🗑️  Deleting: ${group.name}...`);
      await storyblokRequest(`/component_groups/${group.id}`, "DELETE");
      console.log("   ✅ Deleted successfully");
    } catch (error) {
      console.error("   ❌ Failed to delete:", error);
    }
  }

  console.log("\n✨ Cleanup complete!");
}

cleanupDuplicateGroups().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
