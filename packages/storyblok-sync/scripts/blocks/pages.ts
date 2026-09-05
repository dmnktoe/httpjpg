import { WORK_TAG_DATASOURCE_SLUG } from "@httpjpg/storyblok-utils";

import type { BlockDef } from "../lib/block";
import { field } from "../lib/fields";
import { inlineOptions } from "../lib/options";

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
    name: "floating_item",
    display_name: "Floating media",
    group: "Pages",
    icon: "block-image",
    color: "#38b2ac",
    preview_field: "name",
    schema: {
      name: field.text("Name", {
        required: true,
        translatable: true,
        description: "Label on the drag handle above the frame.",
        tooltip: true,
      }),
      file: field.asset("File", ["images", "videos"], {
        allow_external_url: true,
        description: "Image or native video. Prefer this over a pasted URL.",
        tooltip: true,
      }),
      url: field.text("URL", {
        description:
          "Direct image or mp4 URL when the file is not a Storyblok asset. YouTube and Vimeo stay in the regular Video blok.",
        tooltip: true,
      }),
      width: field.options("Width", inlineOptions.floatingMediaWidth, {
        default_value: "400",
      }),
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
      tags: field.datasourceMulti("Tags", WORK_TAG_DATASOURCE_SLUG, {
        description:
          "What this work is about. Drives the chips on the card, the work-list filter, related work and search ranking. Separate from the story's Storyblok tags, which decide whether it lands under Projects or Websites.",
        tooltip: true,
      }),
      date: field.datetime("Date"),
      date_end: field.datetime("End Date"),
      link: field.multilink("Link"),
      external_only: field.boolean("External Only", "false", {
        description: "Links straight to the external URL instead of an on-site detail page.",
        tooltip: true,
      }),
      show_in_app: field.boolean("Show in iOS-App", "true", {
        description: "Lists this work in the app's work list. Off leaves it in the sidebar only.",
        tooltip: true,
      }),
      accentColor: field.text("Project Accent Color", {
        description:
          "Hex colour (#RGB or #RRGGBB). Tints the iOS liquid-glass chrome and the site chrome on this work page — preview badge, card arrow, selection.",
        tooltip: true,
        regex: "^(#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3}))?$",
        max_length: 7,
      }),
      floating_media: {
        ...field.bloks("Floating media", { whitelist: ["floating_item"] }),
        description:
          "Images and native videos scattered on the work page as draggable frames. Width is a pixel dropdown (default 400px). Separate from in-flow image/video bloks.",
        tooltip: true,
      },
      isDark: field.boolean("Dark Mode"),
    },
  },
];
