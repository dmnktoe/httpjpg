import { type StoryblokComponent, type StoryblokField, storyblokRequest } from "../../src/index";

export type Group = "Layout" | "Content" | "Media" | "Pages" | "Settings";

export interface BlockDef {
  name: string;
  display_name: string;
  group: Group;
  icon: string;
  color: string;
  is_root?: boolean;
  schema: Record<string, StoryblokField>;
}

async function getComponentId(name: string): Promise<number | null> {
  try {
    const response = await storyblokRequest<{
      components: Array<{ id: number; name: string }>;
    }>("/components");
    return response.components?.find((c) => c.name === name)?.id ?? null;
  } catch {
    return null;
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
    schema: def.schema,
  };
}

export async function upsertBlock(def: BlockDef): Promise<void> {
  const component = await toStoryblokComponent(def);
  const existingId = await getComponentId(component.name);
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
