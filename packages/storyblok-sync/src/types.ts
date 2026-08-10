import type { Field } from "@storyblok/schema";

/**
 * The Management API accepts `"true"` / `"false"` strings for a boolean field's
 * default, and that is what this space already stores. The generated schema
 * types only model the boolean form, so widen that one property rather than
 * change the pushed payload.
 */
type BooleanField = Omit<Extract<Field, { type: "boolean" }>, "default_value"> & {
  default_value?: string | boolean;
};

/**
 * A component schema field, discriminated by `type`. Generated from Storyblok's
 * OpenAPI specs by `@storyblok/schema`; only the boolean default is widened.
 */
export type StoryblokField = Exclude<Field, { type: "boolean" }> | BooleanField;

/** Narrows {@link StoryblokField} to a single field type, e.g. `FieldOf<"bloks">`. */
export type FieldOf<T extends StoryblokField["type"]> = Extract<StoryblokField, { type: T }>;

export interface DatasourceEntry {
  name: string;
  value: string;
  dimension_value?: string;
}

export interface Datasource {
  id?: number;
  name: string;
  slug: string;
  dimensions?: Array<{
    id?: number;
    name: string;
    entry_value: string;
    datasource_id?: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ComponentGroup {
  id?: number;
  name: string;
  uuid?: string;
  parent_id?: number | null;
  parent_uuid?: string | null;
}

export interface StoryblokComponent {
  id?: number;
  name: string;
  display_name?: string;
  schema: Record<string, StoryblokField>;
  is_root?: boolean;
  is_nestable?: boolean;
  component_group_uuid?: string;
  image?: string | null;
  preview_field?: string | null;
  preview_tmpl?: string | null;
  color?: string;
  icon?: string;
  internal_tag_ids?: string[];
  content_type_asset_preview?: string;
  created_at?: string;
  updated_at?: string;
  real_name?: string;
  all_presets?: Array<Record<string, unknown>>;
}
