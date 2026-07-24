import { type StoryblokComponent, type StoryblokField, storyblokRequest } from "../../src/index";

export type Group = "Layout" | "Content" | "Media" | "Pages" | "Settings";

export interface BlockDef {
  name: string;
  display_name: string;
  group: Group;
  icon: string;
  color: string;
  is_root?: boolean;
  preview_field?: string;
  preview_tmpl?: string;
  schema: Record<string, StoryblokField>;
}

export async function fetchComponentIds(): Promise<Map<string, number>> {
  const response = await storyblokRequest<{
    components: Array<{ id: number; name: string }>;
  }>("/components");
  return new Map((response.components ?? []).map((c) => [c.name, c.id]));
}

let groupsPromise: Promise<Map<string, string>> | undefined;

async function getGroupUuid(name: string): Promise<string | undefined> {
  groupsPromise ??= storyblokRequest<{
    component_groups: Array<{ uuid: string; name: string }>;
  }>("/component_groups").then(
    (response) => new Map((response.component_groups ?? []).map((g) => [g.name, g.uuid])),
  );
  return (await groupsPromise).get(name);
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
