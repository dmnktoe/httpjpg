/**
 * Single source of truth for every value Storyblok can emit.
 *
 * Storyblok values arrive at runtime. Panda CSS extracts classes at build time.
 * Anything not enumerated here will *not* have a class generated, so a runtime
 * Storyblok value would silently fail (no color, no spacing, no live update in
 * the Visual Editor).
 *
 * Wired into three places:
 *  1. `packages/ui/panda.config.ts` — drives `staticCss` so every class exists.
 *  2. `packages/storyblok-sync/scripts/sync-datasources.ts` — emits these as
 *     datasource entries; the `value` of each entry is exactly the string used
 *     at runtime.
 *  3. `packages/storyblok-ui` components — accept these values as-is, no
 *     runtime translation.
 *
 * Adding a new CMS option = add it here, run sync, rebuild. That's it.
 */

import { colors, spacing, typography } from "@httpjpg/tokens";

type ColorGroup = Record<string | number, string>;
const palette: Record<string, ColorGroup> = {
  neutral: colors.neutral,
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

const colorTokens = (() => {
  const flat: string[] = [colors.black, colors.white];
  for (const group of Object.values(palette)) {
    for (const shade of Object.values(group)) {
      flat.push(shade);
    }
  }
  return flat;
})();

const colorEntries: ReadonlyArray<{ name: string; value: string }> = (() => {
  const entries: Array<{ name: string; value: string }> = [
    { name: "Black", value: colors.black },
    { name: "White", value: colors.white },
  ];
  for (const [groupName, group] of Object.entries(palette)) {
    const label = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    for (const [shade, hex] of Object.entries(group)) {
      entries.push({ name: `${label} ${shade}`, value: hex });
    }
  }
  return entries;
})();

const spacingScale = Object.keys(spacing) as Array<keyof typeof spacing & string>;
const fontSizeScale = Object.keys(typography.fontSize) as Array<
  keyof typeof typography.fontSize & string
>;
const fontWeightScale = Object.keys(typography.fontWeight) as Array<
  keyof typeof typography.fontWeight & string
>;
const fontFamilyScale = Object.keys(typography.fontFamily) as Array<
  keyof typeof typography.fontFamily & string
>;

const gridColumnScale = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "auto",
] as const;
const gridSpanScale = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "full",
] as const;
const aspectRatioScale = ["16/9", "4/3", "1/1", "3/4", "9/16", "21/9"] as const;
const widthScale = ["sm", "md", "lg", "xl", "2xl", "fluid"] as const;
const imageWidthScale = ["5%", "25%", "33%", "50%", "65%", "75%", "100%"] as const;
const proseMaxWidthScale = ["none", "45ch", "65ch", "80ch", "100ch"] as const;
const alignItemsScale = ["start", "center", "end", "stretch", "baseline"] as const;
const justifyItemsScale = ["start", "center", "end", "stretch"] as const;
const justifyContentScale = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;
const gridFlowScale = ["row", "column", "row-dense", "column-dense"] as const;
const textAlignScale = ["left", "center", "right", "justify"] as const;

/**
 * The complete CMS contract. Mutating this map *will* require a Panda rebuild
 * and a Storyblok sync.
 */
export const CMS_OPTIONS = {
  colors: colorTokens,
  colorEntries,
  spacing: spacingScale,
  fontSize: fontSizeScale,
  fontWeight: fontWeightScale,
  fontFamily: fontFamilyScale,
  gridColumn: gridColumnScale,
  gridSpan: gridSpanScale,
  aspectRatio: aspectRatioScale,
  width: widthScale,
  imageWidth: imageWidthScale,
  proseMaxWidth: proseMaxWidthScale,
  alignItems: alignItemsScale,
  justifyItems: justifyItemsScale,
  justifyContent: justifyContentScale,
  gridFlow: gridFlowScale,
  textAlign: textAlignScale,
} as const;

export type CmsColor = (typeof colorTokens)[number];
export type CmsSpacing = (typeof spacingScale)[number];
export type CmsFontSize = (typeof fontSizeScale)[number];
export type CmsFontWeight = (typeof fontWeightScale)[number];
export type CmsFontFamily = (typeof fontFamilyScale)[number];
export type CmsGridColumn = (typeof gridColumnScale)[number];
export type CmsGridSpan = (typeof gridSpanScale)[number];
export type CmsAspectRatio = (typeof aspectRatioScale)[number];
export type CmsWidth = (typeof widthScale)[number];
export type CmsImageWidth = (typeof imageWidthScale)[number];
export type CmsProseMaxWidth = (typeof proseMaxWidthScale)[number];
export type CmsAlignItems = (typeof alignItemsScale)[number];
export type CmsJustifyItems = (typeof justifyItemsScale)[number];
export type CmsJustifyContent = (typeof justifyContentScale)[number];
export type CmsGridFlow = (typeof gridFlowScale)[number];
export type CmsTextAlign = (typeof textAlignScale)[number];
