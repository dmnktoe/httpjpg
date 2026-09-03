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

/** Draft status + optional Storyblok edit + exit. Used by the layout host and page fallback. */
export function editorBadgeActions(editHref?: string | null): FloatingBadgeAction[] {
  return [
    DRAFT_STATUS_ACTION,
    ...(editHref
      ? [
          {
            href: editHref,
            label: "edit",
            glyph: "✎",
            ariaLabel: "Edit in Storyblok",
          } satisfies FloatingBadgeAction,
        ]
      : []),
    EXIT_DRAFT_ACTION,
  ];
}
