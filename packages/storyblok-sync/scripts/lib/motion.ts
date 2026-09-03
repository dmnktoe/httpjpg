import type { StoryblokField } from "../../src/index";
import { field, tabbed } from "./fields";
import { inlineOptions } from "./options";

/**
 * Append the Motion tab (`animation` + `animationDelay`). Compose with spacing:
 * `withSpacing(withMotion(schema))`. Read at runtime by `EntranceMotion`.
 */
export function withMotion(schema: Record<string, StoryblokField>): Record<string, StoryblokField> {
  return {
    ...schema,
    ...tabbed("Motion", "motion", {
      animation: field.options("Entrance Animation", inlineOptions.entranceAnimation, {
        default_value: "none",
        description:
          "Plays once when the blok scrolls into view. Off under reduced motion; none keeps existing pages still.",
        tooltip: true,
      }),
      animationDelay: field.number("Animation Delay (s)", { default_value: "0" }),
    }),
  };
}
