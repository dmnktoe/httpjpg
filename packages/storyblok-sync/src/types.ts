/**
 * TypeScript types for Storyblok Management API
 */

export interface DatasourceEntry {
  name: string;
  value: string;
}

export interface Datasource {
  name: string;
  slug: string;
  dimensions?: Array<{ name: string; entry_value: string }>;
}

export interface StoryblokField {
  type: string;
  display_name?: string;
  required?: boolean;
  pos?: number;
  source?: string;
  datasource_slug?: string;
  default_value?: string;
  options?: Array<{ name: string; value: string }>;
  restrict_components?: boolean;
  component_whitelist?: string[];
  filter_content_type?: string[];
  translatable?: boolean;
  filetypes?: string[];
}

export interface StoryblokComponent {
  name: string;
  display_name?: string;
  schema: Record<string, StoryblokField>;
  is_root?: boolean;
  is_nestable?: boolean;
  component_group_uuid?: string;
}
