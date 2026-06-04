import type { BlockDef } from "../lib/block";
import { field } from "../lib/fields";

export const pageBlocks: BlockDef[] = [
  {
    name: "page",
    display_name: "Page",
    group: "Pages",
    is_root: true,
    icon: "block-doc",
    color: "#3b82f6",
    preview_field: "title",
    schema: {
      body: field.bloks("Body"),
      title: field.text("Title", { translatable: true }),
      isDark: field.boolean("Dark Mode"),
    },
  },
  {
    name: "work",
    display_name: "Work Page",
    group: "Pages",
    is_root: true,
    icon: "block-suitcase",
    color: "#f59e0b",
    preview_field: "title",
    schema: {
      body: field.bloks("Body"),
      title: field.text("Title", { translatable: true }),
      description: field.richtext("Description", { translatable: true }),
      images: field.multiasset("Featured Images", ["images", "videos"], {
        allow_external_url: true,
      }),
      date: field.datetime("Date"),
      date_end: field.datetime("End Date"),
      link: field.multilink("Link"),
      external_only: field.boolean("External Only", "false", {
        description: "Links straight to the external URL instead of an on-site detail page.",
        tooltip: true,
      }),
      isDark: field.boolean("Dark Mode"),
    },
  },
];
