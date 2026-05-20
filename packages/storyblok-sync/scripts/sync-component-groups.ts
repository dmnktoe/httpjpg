#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local") });

import { type ComponentGroup, storyblokRequest, validateEnv } from "../src/index";

type RemoteGroup = ComponentGroup & { id: number; uuid: string };

async function listGroups(): Promise<RemoteGroup[]> {
  try {
    const response = await storyblokRequest<{
      component_groups: RemoteGroup[];
    }>("/component_groups");
    return response.component_groups || [];
  } catch {
    return [];
  }
}

async function upsertGroup(group: ComponentGroup): Promise<RemoteGroup> {
  const existing = (await listGroups()).find((g) => g.name === group.name);
  if (existing) {
    return existing;
  }
  const response = await storyblokRequest<{ component_group: RemoteGroup }>(
    "/component_groups",
    "POST",
    { component_group: group },
  );
  return response.component_group;
}

const GROUPS: ComponentGroup[] = [
  { name: "Layout", parent_id: null, parent_uuid: null },
  { name: "Content", parent_id: null, parent_uuid: null },
  { name: "Media", parent_id: null, parent_uuid: null },
  { name: "Pages", parent_id: null, parent_uuid: null },
  { name: "Settings", parent_id: null, parent_uuid: null },
];

async function syncGroups() {
  validateEnv();
  for (const group of GROUPS) {
    const created = await upsertGroup(group);
    console.log(`✓ ${group.name} (${created.uuid})`);
  }
}

syncGroups().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
