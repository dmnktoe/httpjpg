import { storyblokEditorHrefFromEditable } from "@httpjpg/storyblok-utils";
import type { FloatingBadgeAction } from "@httpjpg/ui";

export interface DraftEditorChrome {
  editHref: string | null;
  gridToggle: boolean;
  actions: FloatingBadgeAction[] | undefined;
}

/** Edit + exit pills for draft / Visual Editor payloads (`_editable` present). */
export function draftEditorChrome(editable?: unknown): DraftEditorChrome {
  const raw = typeof editable === "string" ? editable : undefined;
  const editHref = storyblokEditorHrefFromEditable(raw);
  if (!editHref) {
    return { editHref: null, gridToggle: false, actions: undefined };
  }
  return {
    editHref,
    gridToggle: true,
    actions: [
      {
        href: editHref,
        label: "edit",
        glyph: "✎",
        ariaLabel: "Edit in Storyblok",
      },
      {
        href: "/api/exit-draft",
        label: "exit",
        glyph: "×",
        ariaLabel: "Exit draft preview",
        external: false,
        hideInIframe: true,
      },
    ],
  };
}
