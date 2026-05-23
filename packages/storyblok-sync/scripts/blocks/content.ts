import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";

import type { BlockDef } from "../lib/block";
import { field, labelize, tabbed } from "../lib/fields";
import { inlineOptions, OVERLAY_PATTERN_OPTIONS } from "../lib/options";
import { withSpacing } from "../lib/spacing";

const DIVIDER_VARIANT_OPTIONS = [
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
  { name: "ASCII", value: "ascii" },
  { name: "Custom", value: "custom" },
];

const DIVIDER_ORIENTATION_OPTIONS = [
  { name: "Horizontal", value: "horizontal" },
  { name: "Vertical", value: "vertical" },
];

const ICON_NAME_OPTIONS = [
  { name: "Arrow Up", value: "arrow-up" },
  { name: "Arrow Down", value: "arrow-down" },
  { name: "Arrow Left", value: "arrow-left" },
  { name: "Arrow Right", value: "arrow-right" },
  { name: "Play", value: "play" },
  { name: "Pause", value: "pause" },
  { name: "Volume", value: "volume" },
  { name: "Volume (mute)", value: "volume-mute" },
];

const NAV_LINK_VARIANT_OPTIONS = [
  { name: "Personal", value: "personal" },
  { name: "Client", value: "client" },
];

const LIST_SIZE_OPTIONS = labelize(["sm", "md", "lg"] as const);
const LIST_SPACING_OPTIONS = labelize(["0", "1", "2", "3", "4"] as const);
const UNORDERED_STYLE_OPTIONS = labelize(["disc", "circle", "square", "none"] as const);
const ORDERED_STYLE_OPTIONS = [
  { name: "Decimal (1.)", value: "decimal" },
  { name: "Lower Alpha (a.)", value: "lower-alpha" },
  { name: "Lower Roman (i.)", value: "lower-roman" },
  { name: "Upper Alpha (A.)", value: "upper-alpha" },
  { name: "Upper Roman (I.)", value: "upper-roman" },
];

const ACCORDION_VARIANT_OPTIONS = [
  { name: "Default", value: "default" },
  { name: "Bordered", value: "bordered" },
  { name: "Brutalist", value: "brutalist" },
];

const ACCORDION_SIZE_OPTIONS = labelize(["sm", "md", "lg"] as const);

const CALLOUT_TONE_OPTIONS = [
  { name: "Neutral", value: "neutral" },
  { name: "Info", value: "info" },
  { name: "Success", value: "success" },
  { name: "Warning", value: "warning" },
  { name: "Danger", value: "danger" },
  { name: "Brutalist", value: "brutalist" },
];

const CTA_VARIANT_OPTIONS = [
  { name: "Primary", value: "primary" },
  { name: "Secondary", value: "secondary" },
  { name: "Outline", value: "outline" },
];

const CALLOUT_ALIGN_OPTIONS = labelize(["start", "center"] as const);

const STATS_VARIANT_OPTIONS = [
  { name: "Default", value: "default" },
  { name: "Boxed", value: "boxed" },
  { name: "Brutalist", value: "brutalist" },
];

const STATS_COLUMN_OPTIONS = [
  { name: "1 Column", value: "1" },
  { name: "2 Columns", value: "2" },
  { name: "3 Columns", value: "3" },
  { name: "4 Columns", value: "4" },
];

const STATS_ALIGN_OPTIONS = [
  { name: "Left", value: "left" },
  { name: "Center", value: "center" },
];

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
  {
    name: "divider",
    display_name: "Divider",
    group: "Content",
    icon: "block-minus",
    color: "#a0aec0",
    schema: withSpacing({
      variant: field.options("Variant", DIVIDER_VARIANT_OPTIONS, { default_value: "solid" }),
      orientation: field.options("Orientation", DIVIDER_ORIENTATION_OPTIONS, {
        default_value: "horizontal",
      }),
      pattern: field.text("ASCII Pattern (for variant=ascii)", { translatable: true }),
      label: field.text("Label (replaces pattern)", { translatable: true }),
      thickness: field.text("Thickness (CSS length)", { default_value: "1px" }),
      color: field.datasource("Color", "color-options"),
      spacing: field.datasource("Spacing", "spacing-options"),
    }),
  },
  {
    name: "link",
    display_name: "Link",
    group: "Content",
    icon: "block-link",
    color: "#4299e1",
    schema: withSpacing({
      text: field.text("Text", { required: true, translatable: true }),
      link: field.multilink("Link", { required: true }),
      showExternalIcon: field.boolean("Show External Icon"),
      color: field.datasource("Color", "color-options"),
    }),
  },
  {
    name: "nav_link",
    display_name: "Nav Link",
    group: "Content",
    icon: "block-link",
    color: "#4299e1",
    schema: withSpacing({
      text: field.text("Text", { required: true, translatable: true }),
      link: field.multilink("Link", { required: true }),
      variant: field.options("Variant", NAV_LINK_VARIANT_OPTIONS, { default_value: "personal" }),
      showExternalIcon: field.boolean("Show External Icon"),
    }),
  },
  {
    name: "icon",
    display_name: "Icon",
    group: "Content",
    icon: "block-star",
    color: "#ed8936",
    schema: withSpacing({
      name: field.options("Icon", ICON_NAME_OPTIONS, { required: true }),
      size: field.text("Size (CSS length)", { default_value: "32px" }),
      color: field.datasource("Color", "color-options"),
      label: field.text("Aria Label", { translatable: true }),
    }),
  },
  {
    name: "list_item",
    display_name: "List Item",
    group: "Content",
    icon: "block-paragraph",
    color: "#a0aec0",
    schema: {
      text: field.text("Text", { required: true, translatable: true }),
    },
  },
  {
    name: "list",
    display_name: "List",
    group: "Content",
    icon: "block-list",
    color: "#a0aec0",
    schema: withSpacing({
      items: field.bloks("Items", { required: true, whitelist: ["list_item"] }),
      ordered: field.boolean("Ordered List"),
      size: field.options("Size", LIST_SIZE_OPTIONS, { default_value: "sm" }),
      itemSpacing: field.options("Item Spacing", LIST_SPACING_OPTIONS, { default_value: "2" }),
      unorderedStyle: field.options("Bullet Style", UNORDERED_STYLE_OPTIONS, {
        default_value: "disc",
      }),
      orderedStyle: field.options("Number Style", ORDERED_STYLE_OPTIONS, {
        default_value: "decimal",
      }),
      color: field.datasource("Color", "color-options"),
    }),
  },
  {
    name: "accordion_item",
    display_name: "Accordion Item",
    group: "Content",
    icon: "block-paragraph",
    color: "#9f7aea",
    schema: {
      title: field.text("Title", { required: true, translatable: true }),
      content: field.textarea("Content", { required: true, translatable: true }),
      defaultOpen: field.boolean("Open by Default"),
    },
  },
  {
    name: "accordion",
    display_name: "Accordion / FAQ",
    group: "Content",
    icon: "block-list",
    color: "#9f7aea",
    schema: withSpacing({
      items: field.bloks("Items", { required: true, whitelist: ["accordion_item"] }),
      allowMultiple: field.boolean("Allow Multiple Open"),
      variant: field.options("Variant", ACCORDION_VARIANT_OPTIONS, { default_value: "default" }),
      size: field.options("Size", ACCORDION_SIZE_OPTIONS, { default_value: "md" }),
    }),
  },
  {
    name: "callout",
    display_name: "Callout / CTA",
    group: "Content",
    icon: "block-quote",
    color: "#ed64a6",
    schema: withSpacing({
      title: field.text("Title", { translatable: true }),
      body: field.textarea("Body", { required: true, translatable: true }),
      tone: field.options("Tone", CALLOUT_TONE_OPTIONS, { default_value: "neutral" }),
      align: field.options("Align", CALLOUT_ALIGN_OPTIONS, { default_value: "start" }),
      ...tabbed("CTA", "cta", {
        ctaText: field.text("CTA Text", { translatable: true }),
        ctaLink: field.multilink("CTA Link"),
        ctaVariant: field.options("CTA Variant", CTA_VARIANT_OPTIONS, {
          default_value: "primary",
        }),
      }),
    }),
  },
  {
    name: "code_block",
    display_name: "Code Block",
    group: "Content",
    icon: "block-code",
    color: "#1a202c",
    schema: withSpacing({
      code: field.textarea("Code", { required: true }),
      language: field.text("Language (display only)"),
      filename: field.text("Filename"),
      showLineNumbers: field.boolean("Show Line Numbers"),
      copyable: field.boolean("Show Copy Button", "true"),
    }),
  },
  {
    name: "stat_item",
    display_name: "Stat Item",
    group: "Content",
    icon: "block-paragraph",
    color: "#48bb78",
    schema: {
      value: field.text("Value", { required: true, translatable: true }),
      label: field.text("Label", { required: true, translatable: true }),
      caption: field.text("Caption", { translatable: true }),
    },
  },
  {
    name: "stats",
    display_name: "Stats / Metrics",
    group: "Content",
    icon: "block-grid",
    color: "#48bb78",
    schema: withSpacing({
      items: field.bloks("Items", { required: true, whitelist: ["stat_item"] }),
      columns: field.options("Columns", STATS_COLUMN_OPTIONS, { default_value: "3" }),
      variant: field.options("Variant", STATS_VARIANT_OPTIONS, { default_value: "default" }),
      align: field.options("Align", STATS_ALIGN_OPTIONS, { default_value: "left" }),
    }),
  },
];
