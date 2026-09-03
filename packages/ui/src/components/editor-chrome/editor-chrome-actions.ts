import type { FloatingBadgeAction } from "../floating-badge/floating-badge";

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
