import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { typography } from "@httpjpg/tokens";

const widthLabels: Record<string, string> = {
  sm: "Small (640px)",
  md: "Medium (768px)",
  lg: "Large (1024px)",
  xl: "XL (1280px)",
  "2xl": "2XL (1536px)",
  fluid: "Fluid",
};

const aspectRatioLabels: Record<string, string> = {
  "16/9": "16:9 (Landscape)",
  "4/3": "4:3 (Standard)",
  "1/1": "1:1 (Square)",
  "3/4": "3:4 (Portrait)",
  "9/16": "9:16 (Vertical)",
  "21/9": "21:9 (Ultrawide)",
};

const proseMaxWidthLabels: Record<string, string> = {
  none: "None (Full width)",
  "45ch": "Narrow (45ch)",
  "65ch": "Readable (65ch)",
  "80ch": "Wide (80ch)",
  "100ch": "Extra Wide (100ch)",
};

/**
 * Mirrors the `OverlayPattern` union exported by `@httpjpg/ui`. Kept in
 * lock-step manually since storyblok-sync doesn't depend on the UI package.
 */
export const OVERLAY_PATTERN_OPTIONS = [
  { name: "None (off)", value: "none" },
  { name: "Random (per image)", value: "random" },
  { name: "Stars ✦", value: "stars" },
  { name: "Sparkles ⋆", value: "sparkles" },
  { name: "Hearts ♡", value: "hearts" },
  { name: "Confetti ◆", value: "confetti" },
  { name: "Tape ▰▱", value: "tape" },
  { name: "Dots ·", value: "dots" },
  { name: "Arrows ↗", value: "arrows" },
  { name: "Ghost", value: "ghost" },
  { name: "Bracket ┌┐", value: "bracket" },
  { name: "Noise ▓▒░", value: "noise" },
  { name: "Runes ᚲ", value: "runes" },
];

/**
 * Static option lists derived from the token map. These used to live in
 * Storyblok datasources, but the free plan caps datasources at 10 and
 * design tokens never change at editor time — so we inline them as
 * `field.options(...)` instead. Same dropdown UX, zero datasource cost.
 */
export const inlineOptions = {
  width: CMS_OPTIONS.width.map((value) => ({ name: widthLabels[value], value })),
  imageWidth: CMS_OPTIONS.imageWidth.map((value) => ({ name: value, value })),
  aspectRatio: CMS_OPTIONS.aspectRatio.map((value) => ({
    name: aspectRatioLabels[value],
    value,
  })),
  proseMaxWidth: CMS_OPTIONS.proseMaxWidth.map((value) => ({
    name: proseMaxWidthLabels[value],
    value,
  })),
  gridColumn: CMS_OPTIONS.gridColumn.map((value) => ({
    name: value === "auto" ? "Auto Fit" : `${value} Column${value === "1" ? "" : "s"}`,
    value,
  })),
  fontSize: CMS_OPTIONS.fontSize.map((key) => ({
    name: `${key.toUpperCase()} (${typography.fontSize[key as keyof typeof typography.fontSize]})`,
    value: key,
  })),
  fontWeight: CMS_OPTIONS.fontWeight.map((key) => ({
    name: `${key.charAt(0).toUpperCase() + key.slice(1)} (${typography.fontWeight[key as keyof typeof typography.fontWeight]})`,
    value: key,
  })),
};
