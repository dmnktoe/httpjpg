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

export interface StoryblokField {
  type: string;
  display_name?: string;
  description?: string;
  tooltip?: boolean;
  required?: boolean;
  pos?: number;
  translatable?: boolean;
  default_value?: string;

  restrict_components?: boolean;
  restrict_type?: string;
  component_whitelist?: string[];
  component_tag_whitelist?: number[];
  component_group_whitelist?: string[];
  maximum?: number;
  minimum?: number;

  source?: "internal" | "internal_stories" | "external" | "internal_languages";
  datasource_slug?: string;
  external_datasource?: string;
  options?: Array<{ name: string; value: string }>;
  use_uuid?: boolean;
  exclude_empty_option?: boolean;
  max_options?: string;
  min_options?: string;

  filter_content_type?: string[];
  folder_slug?: string;
  filetypes?: string[];
  asset_folder_id?: number;
  allow_external_url?: boolean;
  allow_target_blank?: boolean;
  allow_custom_attributes?: boolean;
  email_link_type?: boolean;
  asset_link_type?: boolean;
  show_anchor?: boolean;
  restrict_content_types?: boolean;
  force_link_scope?: boolean;
  link_scope?: string;

  no_translate?: boolean;
  rtl?: boolean;
  regex?: string;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  decimals?: number;
  steps?: number;

  rich_markdown?: boolean;
  allow_multiline?: boolean;
  customize_toolbar?: boolean;
  toolbar?: string[];
  style_options?: Array<{ name: string; value: string }>;

  disable_time?: boolean;

  inline_label?: boolean;

  keys?: string[];

  field_type?: string;
  required_fields?: string;

  can_sync?: boolean;
  exclude_from_merge?: boolean;
  exclude_from_overwrite?: boolean;
  force_merge?: boolean;
  conditional_settings?: Array<Record<string, unknown>>;
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
