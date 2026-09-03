import type { FloatingBadgeAction } from "./floating-badge";

/** Live URL pill for a work page. Accented so the cluster can tint it. */
export function workPreviewAction(href: string, label = "preview"): FloatingBadgeAction {
  return {
    href,
    label,
    glyph: "↗",
    ariaLabel: `${label} — open external preview`,
    accented: true,
  };
}
