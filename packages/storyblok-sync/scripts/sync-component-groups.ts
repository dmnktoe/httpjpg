#!/usr/bin/env tsx
/**
 * Sync Storyblok Component Groups (Folders)
 *
 * This script creates/updates component folders in the Block Library
 * to organize your components logically.
 *
 * Usage:
 *   pnpm --filter @httpjpg/storyblok-sync sync:groups
 *
 * Environment Variables Required:
 *   STORYBLOK_MANAGEMENT_TOKEN - Personal Access Token from Storyblok
 *   STORYBLOK_SPACE_ID - Your Storyblok Space ID
 */

import {
  type ComponentGroup,
  storyblokRequest,
  validateEnv,
} from "../src/index";

/**
 * Get all existing component groups
 */
async function getComponentGroups(): Promise<
  Array<ComponentGroup & { id: number; uuid: string }>
> {
  try {
    const response = await storyblokRequest<{
      component_groups: Array<ComponentGroup & { id: number; uuid: string }>;
    }>("/component_groups");
    return response.component_groups || [];
  } catch {
    return [];
  }
}

/**
 * Create or update a component group
 */
async function createOrUpdateComponentGroup(
  group: ComponentGroup,
): Promise<ComponentGroup & { id: number; uuid: string }> {
  const existing = (await getComponentGroups()).find(
    (g) => g.name === group.name,
  );

  if (existing) {
    console.log(`📁 Component group already exists: ${group.name}`);
    return existing;
  }

  console.log(`✨ Creating component group: ${group.name}`);

  const response = await storyblokRequest<{
    component_group: ComponentGroup & { id: number; uuid: string };
  }>("/component_groups", "POST", {
    component_group: group,
  });

  return response.component_group;
}

/**
 * Component Group Definitions
 */
const componentGroups: ComponentGroup[] = [
  {
    name: "Layout",
    parent_id: null,
    parent_uuid: null,
  },
  {
    name: "Content",
    parent_id: null,
    parent_uuid: null,
  },
  {
    name: "Media",
    parent_id: null,
    parent_uuid: null,
  },
];

/**
 * Main sync function
 */
async function syncComponentGroups() {
  console.log("🔄 Starting component groups sync...\n");

  validateEnv();

  const createdGroups: Record<
    string,
    ComponentGroup & { id: number; uuid: string }
  > = {};

  for (const group of componentGroups) {
    const created = await createOrUpdateComponentGroup(group);
    createdGroups[group.name] = created;
  }

  console.log("\n✅ Component groups sync complete!");
  console.log("\nCreated/Updated Groups:");
  for (const [name, group] of Object.entries(createdGroups)) {
    console.log(`  - ${name} (UUID: ${group.uuid})`);
  }
}

// Run the sync
syncComponentGroups().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
