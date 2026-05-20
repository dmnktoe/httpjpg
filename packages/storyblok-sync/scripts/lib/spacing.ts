import type { StoryblokField } from "../../src/index";
import { field } from "./fields";

const SPACING_AXES = {
  mt: "Margin Top",
  mb: "Margin Bottom",
  ml: "Margin Left",
  mr: "Margin Right",
  pt: "Padding Top",
  pb: "Padding Bottom",
  pl: "Padding Left",
  pr: "Padding Right",
} as const;

function spacingSchema() {
  const fields: Record<string, StoryblokField> = {};
  const keys: string[] = [];
  let pos = 100;
  const add = (key: string, label: string) => {
    fields[key] = field.datasource(label, "spacing-options", { pos: pos++ });
    keys.push(key);
  };
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(axis, label);
  }
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(`${axis}Md`, `${label} (Tablet)`);
  }
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(`${axis}Lg`, `${label} (Desktop)`);
  }
  return { tab_spacing: field.tab("Spacing", keys), ...fields };
}

/**
 * Append the canonical Spacing tab (mt/mb/.../pl/pr × base/Md/Lg, 24 fields)
 * to a component schema. Every component that consumes `spacingCss(blok)`
 * at runtime should wrap its own fields in this.
 */
export function withSpacing(
  schema: Record<string, StoryblokField>,
): Record<string, StoryblokField> {
  return { ...schema, ...spacingSchema() };
}
