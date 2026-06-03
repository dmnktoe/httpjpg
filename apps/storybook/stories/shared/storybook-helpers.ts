import { spacing } from "@httpjpg/tokens";

export const SPACING_OPTIONS = Object.keys(spacing).map(Number);
export const COMMON_SPACING_OPTIONS = [0, 1, 2, 4, 6, 8, 12, 16];
export const EXTENDED_SPACING_OPTIONS = [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

export const ALIGN_OPTIONS = ["start", "center", "end", "stretch", "baseline"] as const;
export const JUSTIFY_OPTIONS = ["start", "center", "end", "stretch"] as const;
export const GRID_ALIGN_OPTIONS = ["start", "center", "end", "stretch"] as const;
export const GRID_JUSTIFY_OPTIONS = ["start", "center", "end", "stretch"] as const;
export const FLEX_DIRECTION_OPTIONS = ["row", "column"] as const;
export const FLEX_WRAP_OPTIONS = ["wrap", "nowrap"] as const;
export const GRID_COLUMN_OPTIONS = [1, 2, 3, 4, 6, 12, "auto"] as const;
export const GRID_FLOW_OPTIONS = ["row", "column", "row-dense", "column-dense"] as const;
export const BORDER_STYLE_OPTIONS = ["solid", "dashed", "dotted"] as const;
export const DIVIDER_VARIANT_OPTIONS = ["solid", "dashed", "dotted", "ascii", "custom"] as const;
export const DIVIDER_ORIENTATION_OPTIONS = ["horizontal", "vertical"] as const;
export const ASPECT_RATIO_OPTIONS = ["1/1", "4/3", "16/9", "21/9", "9/16"] as const;
export const OBJECT_FIT_OPTIONS = ["cover", "contain", "fill", "none", "scale-down"] as const;
export const CAPTION_POSITION_OPTIONS = ["inline", "below", "overlay"] as const;
export const CONTAINER_SIZE_OPTIONS = ["sm", "md", "lg", "xl", "2xl", "fluid"] as const;
export const BUTTON_VARIANT_OPTIONS = ["primary", "secondary", "accent", "danger"] as const;
export const HEADLINE_LEVEL_OPTIONS = [1, 2, 3] as const;
export const HEADING_TAG_OPTIONS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function spacingArgType(description: string, defaultValue: number | string = "4") {
  return {
    control: { type: "select" as const },
    options: COMMON_SPACING_OPTIONS,
    description,
    table: {
      defaultValue: { summary: String(defaultValue) },
    },
  };
}

export function extendedSpacingArgType(description: string, defaultValue: number | string = "16") {
  return {
    control: { type: "select" as const },
    options: EXTENDED_SPACING_OPTIONS,
    description,
    table: {
      defaultValue: { summary: String(defaultValue) },
    },
  };
}

export function alignArgType(description: string, defaultValue = "stretch") {
  return {
    control: { type: "select" as const },
    options: ALIGN_OPTIONS,
    description,
    table: {
      defaultValue: { summary: defaultValue },
    },
  };
}

export function justifyArgType(description: string, defaultValue = "start") {
  return {
    control: { type: "select" as const },
    options: JUSTIFY_OPTIONS,
    description,
    table: {
      defaultValue: { summary: defaultValue },
    },
  };
}
