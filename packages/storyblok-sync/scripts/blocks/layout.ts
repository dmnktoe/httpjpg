import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";

import type { BlockDef } from "../lib/block";
import { field, labelize, tabbed } from "../lib/fields";
import { inlineOptions } from "../lib/options";
import { withSpacing } from "../lib/spacing";

const GRID_SPAN_OPTIONS = CMS_OPTIONS.gridSpan.map((v) => ({
  name: v === "full" ? "Full" : v,
  value: v,
}));

const CONTAINER_ALIGN_OPTIONS = [
  { name: "Left", value: "left" },
  { name: "Center", value: "center" },
];

export const layoutBlocks: BlockDef[] = [
  {
    name: "section",
    display_name: "Section",
    group: "Layout",
    icon: "block-section",
    color: "#4a5568",
    schema: withSpacing({
      content: field.bloks("Content", {
        required: true,
        whitelist: [
          "container",
          "grid",
          "headline",
          "paragraph",
          "richtext",
          "button",
          "divider",
          "link",
          "icon",
          "list",
          "accordion",
          "callout",
          "code_block",
          "stats",
        ],
      }),
      bgColor: field.datasource("Background Color", "color-options"),
      ...tabbed("Container", "container", {
        useContainer: field.boolean("Wrap in Container"),
        containerSize: field.options("Container Size", inlineOptions.width, {
          default_value: "2xl",
        }),
        containerAlign: field.options("Container Align", CONTAINER_ALIGN_OPTIONS, {
          default_value: "center",
        }),
      }),
    }),
  },
  {
    name: "container",
    display_name: "Container",
    group: "Layout",
    icon: "block-container",
    color: "#4a5568",
    schema: withSpacing({
      body: field.bloks("Body", { required: true }),
      width: field.options("Container Size", inlineOptions.width, {
        default_value: "lg",
      }),
      center: field.boolean("Center", "true"),
      bgColor: field.datasource("Background Color", "color-options"),
    }),
  },
  {
    name: "grid",
    display_name: "Grid",
    group: "Layout",
    icon: "block-grid",
    color: "#4a5568",
    schema: withSpacing({
      items: field.bloks("Grid Items", { required: true }),
      ...tabbed("Columns", "columns", {
        columns: field.options("Columns", inlineOptions.gridColumn),
        columnsMd: field.options("Columns (Tablet)", inlineOptions.gridColumn),
        columnsLg: field.options("Columns (Desktop)", inlineOptions.gridColumn),
      }),
      ...tabbed("Gaps", "gaps", {
        gap: field.datasource("Gap", "spacing-options"),
        rowGap: field.datasource("Row Gap", "spacing-options"),
        columnGap: field.datasource("Column Gap", "spacing-options"),
      }),
      ...tabbed("Alignment", "alignment", {
        align: field.options("Align Items", labelize(CMS_OPTIONS.alignItems)),
        justify: field.options("Justify Items", labelize(CMS_OPTIONS.justifyItems)),
        justifyContent: field.options("Justify Content", labelize(CMS_OPTIONS.justifyContent)),
        flow: field.options("Auto Flow", labelize(CMS_OPTIONS.gridFlow)),
      }),
      isList: field.boolean("Render as <ul>"),
    }),
  },
  {
    name: "grid_item",
    display_name: "Grid Item",
    group: "Layout",
    icon: "block-square",
    color: "#4a5568",
    schema: {
      content: field.bloks("Content"),
      ...tabbed("Span", "span", {
        colSpan: field.options("Column Span", GRID_SPAN_OPTIONS),
        colSpanMd: field.options("Column Span (Tablet)", GRID_SPAN_OPTIONS),
        colSpanLg: field.options("Column Span (Desktop)", GRID_SPAN_OPTIONS),
        rowSpan: field.number("Row Span"),
        rowSpanMd: field.number("Row Span (Tablet)"),
        rowSpanLg: field.number("Row Span (Desktop)"),
      }),
      ...tabbed("Position", "position", {
        colStart: field.number("Column Start"),
        colEnd: field.number("Column End"),
        rowStart: field.number("Row Start"),
        rowEnd: field.number("Row End"),
      }),
      ...tabbed("Alignment", "alignment", {
        alignSelf: field.options("Align Self", labelize(CMS_OPTIONS.alignItems)),
        justifySelf: field.options("Justify Self", labelize(CMS_OPTIONS.justifyItems)),
      }),
    },
  },
];
