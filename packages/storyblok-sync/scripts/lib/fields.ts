import type { FieldOf, StoryblokField } from "../../src/index";

export type FieldOpts<T extends StoryblokField["type"]> = Partial<FieldOf<T>>;

const datasource = (slug: string) => ({ source: "internal", datasource_slug: slug }) as const;

export const field = {
  text: (display_name: string, opts: FieldOpts<"text"> = {}): FieldOf<"text"> => ({
    type: "text",
    display_name,
    ...opts,
  }),
  textarea: (display_name: string, opts: FieldOpts<"textarea"> = {}): FieldOf<"textarea"> => ({
    type: "textarea",
    display_name,
    ...opts,
  }),
  number: (display_name: string, opts: FieldOpts<"number"> = {}): FieldOf<"number"> => ({
    type: "number",
    display_name,
    ...opts,
  }),
  boolean: (
    display_name: string,
    defaultValue = "false",
    opts: FieldOpts<"boolean"> = {},
  ): FieldOf<"boolean"> => ({
    type: "boolean",
    display_name,
    default_value: defaultValue,
    ...opts,
  }),
  datetime: (display_name: string, opts: FieldOpts<"datetime"> = {}): FieldOf<"datetime"> => ({
    type: "datetime",
    display_name,
    ...opts,
  }),
  asset: (
    display_name: string,
    filetypes?: string[],
    opts: FieldOpts<"asset"> = {},
  ): FieldOf<"asset"> => ({
    type: "asset",
    display_name,
    ...(filetypes && { filetypes }),
    ...opts,
  }),
  multiasset: (
    display_name: string,
    filetypes?: string[],
    opts: FieldOpts<"multiasset"> = {},
  ): FieldOf<"multiasset"> => ({
    type: "multiasset",
    display_name,
    ...(filetypes && { filetypes }),
    ...opts,
  }),
  multilink: (display_name: string, opts: FieldOpts<"multilink"> = {}): FieldOf<"multilink"> => ({
    type: "multilink",
    display_name,
    ...opts,
  }),
  richtext: (display_name: string, opts: FieldOpts<"richtext"> = {}): FieldOf<"richtext"> => ({
    type: "richtext",
    display_name,
    ...opts,
  }),
  bloks: (
    display_name: string,
    opts: { required?: boolean; whitelist?: string[]; maximum?: number } = {},
  ): FieldOf<"bloks"> => ({
    type: "bloks",
    display_name,
    ...(opts.required !== undefined && { required: opts.required }),
    ...(opts.whitelist && {
      restrict_components: true,
      component_whitelist: opts.whitelist,
    }),
    ...(opts.maximum !== undefined && { maximum: opts.maximum }),
  }),
  stories: (
    display_name: string,
    folder_slug?: string,
    opts: FieldOpts<"options"> = {},
  ): FieldOf<"options"> => ({
    type: "options",
    display_name,
    source: "internal_stories",
    ...(folder_slug && { folder_slug }),
    ...opts,
  }),
  datasource: (
    display_name: string,
    slug: string,
    opts: FieldOpts<"option"> = {},
  ): FieldOf<"option"> => ({
    type: "option",
    display_name,
    ...datasource(slug),
    ...opts,
  }),
  /** Multi-select backed by a datasource. `option` is single-choice, `options` is many. */
  datasourceMulti: (
    display_name: string,
    slug: string,
    opts: FieldOpts<"options"> = {},
  ): FieldOf<"options"> => ({
    type: "options",
    display_name,
    ...datasource(slug),
    ...opts,
  }),
  options: (
    display_name: string,
    options: ReadonlyArray<string | { name: string; value: string }>,
    opts: FieldOpts<"option"> = {},
  ): FieldOf<"option"> => ({
    type: "option",
    display_name,
    options: options.map((o) => (typeof o === "string" ? { name: o, value: o } : o)),
    ...opts,
  }),
  tab: (display_name: string, keys: string[]): FieldOf<"tab"> => ({
    type: "tab",
    display_name,
    keys,
  }),
  /** Field plugin — `field_type` must match an installed Storyblok app / registered plugin. */
  custom: (
    display_name: string,
    field_type: string,
    opts: FieldOpts<"custom"> = {},
  ): FieldOf<"custom"> => ({
    type: "custom",
    display_name,
    field_type,
    ...opts,
  }),
  /** Official Colorpicker app (`storyblok-colorpicker`) — palette + free hex input. */
  colorPicker: (display_name: string, opts: FieldOpts<"custom"> = {}): FieldOf<"custom"> => ({
    type: "custom",
    display_name,
    field_type: "storyblok-colorpicker",
    ...opts,
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
