import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";

import type { BlockDef } from "../lib/block";
import { field, labelize, tabbed } from "../lib/fields";
import { inlineOptions, OVERLAY_PATTERN_OPTIONS } from "../lib/options";
import { withSpacing } from "../lib/spacing";

export const contentBlocks: BlockDef[] = [
  {
    name: "headline",
    display_name: "Headline",
    group: "Content",
    icon: "block-heading-2",
    color: "#2d3748",
    schema: withSpacing({
      text: field.text("Text", { required: true, translatable: true }),
      level: field.options(
        "Heading Level",
        [
          { name: "H1", value: "1" },
          { name: "H2", value: "2" },
          { name: "H3", value: "3" },
        ],
        { default_value: "2" },
      ),
      align: field.options("Text Align", labelize(CMS_OPTIONS.textAlign)),
      color: field.datasource("Text Color", "color-options"),
    }),
  },
  {
    name: "paragraph",
    display_name: "Paragraph",
    group: "Content",
    icon: "block-paragraph",
    color: "#2d3748",
    schema: withSpacing({
      text: field.textarea("Text", { required: true, translatable: true }),
      size: field.options("Font Size", inlineOptions.fontSize),
      weight: field.options("Font Weight", inlineOptions.fontWeight),
      align: field.options("Text Align", labelize(CMS_OPTIONS.textAlign)),
      color: field.datasource("Text Color", "color-options"),
    }),
  },
  {
    name: "richtext",
    display_name: "Rich Text",
    group: "Content",
    icon: "block-text",
    color: "#2d3748",
    schema: withSpacing({
      content: field.richtext("Content", {
        required: true,
        translatable: true,
      }),
      maxWidth: field.options("Max Width", inlineOptions.proseMaxWidth),
      color: field.datasource("Text Color", "color-options"),
    }),
  },
  {
    name: "button",
    display_name: "Button",
    group: "Content",
    icon: "block-button",
    color: "#667eea",
    schema: withSpacing({
      text: field.text("Text", { required: true, translatable: true }),
      variant: field.options(
        "Variant",
        [
          { name: "Primary", value: "primary" },
          { name: "Secondary", value: "secondary" },
          { name: "Outline", value: "outline" },
          { name: "Disabled", value: "disabled" },
        ],
        { default_value: "primary" },
      ),
      size: field.options(
        "Size",
        [
          { name: "Small", value: "sm" },
          { name: "Medium", value: "md" },
          { name: "Large", value: "lg" },
        ],
        { default_value: "md" },
      ),
      type: field.options(
        "Type",
        [
          { name: "Button", value: "button" },
          { name: "Submit", value: "submit" },
          { name: "Reset", value: "reset" },
        ],
        { default_value: "button" },
      ),
      disabled: field.boolean("Disabled"),
      link: field.multilink("Link"),
    }),
  },
  {
    name: "work_card",
    display_name: "Work Card",
    group: "Content",
    icon: "block-image-text",
    color: "#8b5cf6",
    schema: withSpacing({
      title: field.text("Title", { required: true, translatable: true }),
      description: field.textarea("Description", { translatable: true }),
      slug: field.text("Slug", { required: true }),
      images: field.multiasset("Images", ["images"], { required: true }),
      ...tabbed("Dates", "dates", {
        date: field.datetime("Date"),
        date_end: field.datetime("End Date"),
      }),
      ...tabbed("Layout", "layout", {
        variant: field.options(
          "Variant",
          [
            { name: "Default", value: "default" },
            { name: "Compact (no description)", value: "compact" },
            { name: "Featured (oversized title)", value: "featured" },
          ],
          { default_value: "default" },
        ),
        baseUrl: field.text("Base URL", { default_value: "/work" }),
        priority: field.boolean("LCP Priority (eager + fetchpriority=high)"),
        tags: field.text("Tags (comma-separated)"),
      }),
      ...tabbed("Effects", "effects", {
        overlay: field.options("ASCII Overlay", OVERLAY_PATTERN_OPTIONS, {
          default_value: "random",
        }),
        overlayInset: field.number("Overlay Inset (%, particles inward)", {
          default_value: "6",
        }),
      }),
    }),
  },
  {
    name: "work_list",
    display_name: "Work List",
    group: "Content",
    icon: "block-list",
    color: "#8b5cf6",
    schema: withSpacing({
      work: field.stories("Work Items", "work/"),
      gap: field.datasource("Item Gap", "spacing-options"),
      ...tabbed("Layout", "layout", {
        columns: field.options(
          "Columns",
          [
            { name: "1 (stacked)", value: "1" },
            { name: "2", value: "2" },
            { name: "3", value: "3" },
            { name: "4", value: "4" },
          ],
          { default_value: "1" },
        ),
        columnsMd: field.options("Columns (Tablet)", [
          { name: "1", value: "1" },
          { name: "2", value: "2" },
          { name: "3", value: "3" },
          { name: "4", value: "4" },
        ]),
        columnsLg: field.options("Columns (Desktop)", [
          { name: "1", value: "1" },
          { name: "2", value: "2" },
          { name: "3", value: "3" },
          { name: "4", value: "4" },
        ]),
        variant: field.options(
          "Card Variant",
          [
            { name: "Default", value: "default" },
            { name: "Compact", value: "compact" },
            { name: "Featured", value: "featured" },
          ],
          { default_value: "default" },
        ),
        enableTagFilter: field.boolean("Show Tag Filter Bar"),
      }),
      ...tabbed("Dividers", "dividers", {
        showDividers: field.boolean("Show Dividers (stacked only)"),
        dividerVariant: field.options(
          "Divider Style",
          [
            { name: "Solid", value: "solid" },
            { name: "Dashed", value: "dashed" },
            { name: "Dotted", value: "dotted" },
            { name: "ASCII", value: "ascii" },
          ],
          { default_value: "solid" },
        ),
        dividerPattern: field.text("Divider ASCII Pattern", {
          default_value: "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚",
        }),
        dividerColor: field.datasource("Divider Color", "color-options"),
        dividerSpacing: field.datasource("Divider Spacing", "spacing-options"),
      }),
    }),
  },
];
