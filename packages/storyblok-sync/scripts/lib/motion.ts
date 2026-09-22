import type { StoryblokField } from "../../src/index";
import { field, tabbed } from "./fields";

/** Mirrors `AnimationType` from `@httpjpg/ui` — sync does not depend on ui. */
export const ENTRANCE_ANIMATION_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Fade In", value: "fadeIn" },
  { name: "Zoom In", value: "zoomIn" },
  { name: "Zoom Sharpen", value: "zoomSharpen" },
  { name: "Sharpen", value: "sharpen" },
  { name: "Slide In Left", value: "slideInFromLeft" },
  { name: "Slide In Right", value: "slideInFromRight" },
  { name: "Slide Up", value: "slideUp" },
  { name: "Slide Down", value: "slideDown" },
] as const;

function motionSchema(): Record<string, StoryblokField> {
  return tabbed("Motion", "motion", {
    animation: field.options("Entrance Animation", ENTRANCE_ANIMATION_OPTIONS, {
      default_value: "none",
      description:
        "Plays once when the blok scrolls into view. Off under reduced motion, and defaults to none so existing pages stay still.",
      tooltip: true,
    }),
    animationDelay: field.number("Animation Delay (s)", {
      default_value: "0",
    }),
  });
}

/** Append the Motion tab. Compose with `withSpacing()`: `withSpacing(withMotion(schema))`. */
export function withMotion(schema: Record<string, StoryblokField>): Record<string, StoryblokField> {
  return { ...schema, ...motionSchema() };
}
