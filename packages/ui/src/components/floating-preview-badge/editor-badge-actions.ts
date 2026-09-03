import type { FloatingBadgeAction } from "./floating-preview-badge";

export const DRAFT_STATUS_ACTION = {
  label: "draft",
  glyph: "🔍",
  ariaLabel: "Preview mode — unpublished content",
  presentational: true,
} satisfies FloatingBadgeAction;

export const EXIT_DRAFT_ACTION = {
  href: "/api/exit-draft",
  label: "exit",
  glyph: "×",
  ariaLabel: "Exit draft preview",
  external: false,
  hideInIframe: true,
} satisfies FloatingBadgeAction;

export function previewBadgeAction(href: string, label = "preview"): FloatingBadgeAction {
  return {
    href,
    label,
    glyph: "↗",
    ariaLabel: `${label} — open external preview`,
  };
}

export function editBadgeAction(href: string): FloatingBadgeAction {
  return {
    href,
    label: "edit",
    glyph: "✎",
    ariaLabel: "Edit in Storyblok",
  };
}

export function gridBadgeAction(open: boolean, onClick: () => void): FloatingBadgeAction {
  return {
    label: "grid",
    glyph: "⊞",
    ariaLabel: open ? "Hide 12-column overlay (G)" : "Show 12-column overlay (G)",
    pressed: open,
    onClick,
  };
}
