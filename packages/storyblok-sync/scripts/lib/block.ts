import { type StoryblokComponent, type StoryblokField, storyblokRequest } from "../../src/index";

export type Group = "Layout" | "Content" | "Media" | "Pages" | "Settings";

export interface BlockDef {
  name: string;
  display_name: string;
  group: Group;
  icon: string;
  color: string;
  is_root?: boolean;
  /** Field whose value labels the blok in the editor tree (e.g. `title`). */
  preview_field?: string;
  /** Template that labels the blok in the editor tree, e.g. `{value} {label}`. */
  preview_tmpl?: string;
  schema: Record<string, StoryblokField>;
}

export async function fetchComponentIds(): Promise<Map<string, number>> {
  try {
    const response = await storyblokRequest<{
      components: Array<{ id: number; name: string }>;
    }>("/components");
    return new Map((response.components ?? []).map((c) => [c.name, c.id]));
  } catch {
    return new Map();
  }
}

const groupCache = new Map<string, string | undefined>();

async function getGroupUuid(name: string): Promise<string | undefined> {
  if (groupCache.has(name)) {
    return groupCache.get(name);
  }
  try {
    const response = await storyblokRequest<{
      component_groups: Array<{ uuid: string; name: string }>;
    }>("/component_groups");
    const uuid = response.component_groups?.find((g) => g.name === name)?.uuid;
    groupCache.set(name, uuid);
    return uuid;
  } catch {
    return undefined;
  }
}

async function toStoryblokComponent(def: BlockDef): Promise<StoryblokComponent> {
  return {
    name: def.name,
    display_name: def.display_name,
    is_root: def.is_root ?? false,
    is_nestable: !def.is_root,
    component_group_uuid: await getGroupUuid(def.group),
    icon: def.icon,
    color: def.color,
    ...(def.preview_field && { preview_field: def.preview_field }),
    ...(def.preview_tmpl && { preview_tmpl: def.preview_tmpl }),
    schema: def.schema,
  };
}

export async function upsertBlock(def: BlockDef, existingIds: Map<string, number>): Promise<void> {
  const component = await toStoryblokComponent(def);
  const existingId = existingIds.get(component.name);
  if (existingId) {
    console.log(`📝 ${component.display_name || component.name}`);
    await storyblokRequest(`/components/${existingId}`, "PUT", {
      component: { ...component, id: existingId },
    });
    return;
  }
  console.log(`✨ ${component.display_name || component.name}`);
  await storyblokRequest("/components", "POST", { component });
}
