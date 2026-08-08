#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { done, fail } from "@httpjpg/cli-style";

import { type ComponentGroup, storyblokRequest, validateEnv } from "../src/index";

type RemoteGroup = ComponentGroup & { id: number; uuid: string };

async function listGroups(): Promise<RemoteGroup[]> {
  const response = await storyblokRequest<{
    component_groups: RemoteGroup[];
  }>("/component_groups");
  if (!Array.isArray(response.component_groups)) {
    throw new Error("Malformed /component_groups response: expected a component_groups array");
  }
  return response.component_groups;
}

async function upsertGroup(
  group: ComponentGroup,
  existingByName: Map<string, RemoteGroup>,
): Promise<RemoteGroup> {
  const existing = existingByName.get(group.name);
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
  const existingByName = new Map((await listGroups()).map((g) => [g.name, g]));
  for (const group of GROUPS) {
    const created = await upsertGroup(group, existingByName);
    done(`${group.name} · ${created.uuid}`);
  }
}

syncGroups().catch((error) => {
  fail(`sync failed · ${error}`);
});
