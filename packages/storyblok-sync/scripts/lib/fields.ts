import type { StoryblokField } from "../../src/index";

export type FieldOpts = Partial<StoryblokField>;

const datasource = (slug: string) => ({ source: "internal", datasource_slug: slug }) as const;

export const field = {
  text: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "text",
    display_name,
    ...opts,
  }),
  textarea: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "textarea",
    display_name,
    ...opts,
  }),
  number: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "number",
    display_name,
    ...opts,
  }),
  boolean: (
    display_name: string,
    defaultValue = "false",
    opts: FieldOpts = {},
  ): StoryblokField => ({
    type: "boolean",
    display_name,
    default_value: defaultValue,
    ...opts,
  }),
  datetime: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "datetime",
    display_name,
    ...opts,
  }),
  asset: (display_name: string, filetypes?: string[], opts: FieldOpts = {}): StoryblokField => ({
    type: "asset",
    display_name,
    ...(filetypes && { filetypes }),
    ...opts,
  }),
  multiasset: (
    display_name: string,
    filetypes?: string[],
    opts: FieldOpts = {},
  ): StoryblokField => ({
    type: "multiasset",
    display_name,
    ...(filetypes && { filetypes }),
    ...opts,
  }),
  multilink: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "multilink",
    display_name,
    ...opts,
  }),
  richtext: (display_name: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "richtext",
    display_name,
    ...opts,
  }),
  bloks: (
    display_name: string,
    opts: { required?: boolean; whitelist?: string[]; maximum?: number } = {},
  ): StoryblokField => ({
    type: "bloks",
    display_name,
    ...(opts.required !== undefined && { required: opts.required }),
    ...(opts.whitelist && {
      restrict_components: true,
      component_whitelist: opts.whitelist,
    }),
    ...(opts.maximum !== undefined && { maximum: opts.maximum }),
  }),
  stories: (display_name: string, folder_slug?: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "options",
    display_name,
    source: "internal_stories",
    ...(folder_slug && { folder_slug }),
    ...opts,
  }),
  datasource: (display_name: string, slug: string, opts: FieldOpts = {}): StoryblokField => ({
    type: "option",
    display_name,
    ...datasource(slug),
    ...opts,
  }),
  options: (
    display_name: string,
    options: ReadonlyArray<string | { name: string; value: string }>,
    opts: FieldOpts = {},
  ): StoryblokField => ({
    type: "option",
    display_name,
    options: options.map((o) => (typeof o === "string" ? { name: o, value: o } : o)),
    ...opts,
  }),
  tab: (display_name: string, keys: string[]): StoryblokField => ({
    type: "tab",
    display_name,
    keys,
  }),
};

/** Group fields under a Storyblok editor tab; keys not in any `tabbed()` stay in the default tab. */
export function tabbed(
  label: string,
  prefix: string,
  fields: Record<string, StoryblokField>,
): Record<string, StoryblokField> {
  return { [`tab_${prefix}`]: field.tab(label, Object.keys(fields)), ...fields };
}

/** Pretty-print an enum-style value like `space-between` → `Space Between`. */
export function labelize(values: readonly string[]) {
  return values.map((v) => ({
    name: v.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: v,
  }));
}
