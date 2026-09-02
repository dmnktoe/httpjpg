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

const MARGIN_AXES = ["mt", "mb", "ml", "mr"] as const;

function isMarginAxis(axis: string): boolean {
  return (MARGIN_AXES as readonly string[]).includes(axis);
}

function spacingSchema() {
  const fields: Record<string, StoryblokField> = {};
  const keys: string[] = [];
  let pos = 100;
  const add = (key: string, label: string, datasource: "spacing-options" | "margin-options") => {
    fields[key] = field.datasource(label, datasource, { pos: pos++ });
    keys.push(key);
  };
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(axis, label, isMarginAxis(axis) ? "margin-options" : "spacing-options");
  }
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(
      `${axis}Md`,
      `${label} (Tablet)`,
      isMarginAxis(axis) ? "margin-options" : "spacing-options",
    );
  }
  for (const [axis, label] of Object.entries(SPACING_AXES)) {
    add(
      `${axis}Lg`,
      `${label} (Desktop)`,
      isMarginAxis(axis) ? "margin-options" : "spacing-options",
    );
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

export { withMotion } from "./motion";
