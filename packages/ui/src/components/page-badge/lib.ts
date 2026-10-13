import type { FloatingBadgeAction } from "../floating-badge/floating-badge";

export const EXIT_DRAFT_HREF = "/api/exit-draft";

/** Live URL pill for a work page. The only accented pill in the row. */
export function workPreviewAction(href: string, label = "preview"): FloatingBadgeAction {
  return {
    ariaLabel: `${label} — open external preview`,
    label: `(っ◔◡◔)っ ♥ ${label} •°*“˜.•°*“˜`,
    glyph: "↗",
    href,
    accented: true,
  };
}

export interface DraftActionsOptions {
  editHref?: string | null;
  /** Inside the Visual Editor iframe: no edit link (already there), no exit. */
  inEditor?: boolean;
  gridOpen: boolean;
  onToggleGrid: () => void;
}

/** Draft status · edit · exit · grid. Never accented. */
export function draftActions({
  editHref,
  inEditor = false,
  gridOpen,
  onToggleGrid,
}: DraftActionsOptions): FloatingBadgeAction[] {
  return [
    DRAFT_STATUS,
    ...(editHref && !inEditor ? [editAction(editHref)] : []),
    ...(inEditor ? [] : [EXIT_DRAFT]),
    {
      ariaLabel: "12-column overlay (G)",
      label: "grid",
      glyph: "⊞",
      pressed: gridOpen,
      onClick: onToggleGrid,
    },
  ];
}

function editAction(href: string): FloatingBadgeAction {
  return { ariaLabel: "Edit in Storyblok", label: "edit", glyph: "✎", href };
}

const DRAFT_STATUS: FloatingBadgeAction = {
  ariaLabel: "Draft preview — unpublished content",
  label: "draft",
  glyph: "🔍",
  status: true,
};

const EXIT_DRAFT: FloatingBadgeAction = {
  ariaLabel: "Exit draft preview",
  label: "exit",
  glyph: "×",
  href: EXIT_DRAFT_HREF,
  external: false,
};
