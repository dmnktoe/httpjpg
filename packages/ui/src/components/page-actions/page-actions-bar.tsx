"use client";

import { FloatingActionBar } from "../floating-action-bar/floating-action-bar";
import { draftActions, workPreviewAction } from "./lib";
import type { PageActionsProps } from "./page-actions";
import { PageActionsGrid, useGridShortcut } from "./page-actions-grid";

interface PageActionsBarProps extends PageActionsProps {
  draft?: boolean;
  inEditor?: boolean;
}

/** Live URL (accented) + draft tools in one row. Draft content always gets the tools. */
export function PageActionsBar({
  href,
  editHref,
  accentColor,
  draft = false,
  inEditor = false,
}: PageActionsBarProps) {
  const showDraftTools = draft || Boolean(editHref);
  const [gridOpen, toggleGrid] = useGridShortcut(showDraftTools);

  return (
    <>
      <FloatingActionBar
        accentColor={accentColor}
        actions={[
          ...(href ? [workPreviewAction(href)] : []),
          ...(showDraftTools
            ? draftActions({ editHref, inEditor, gridOpen, onToggleGrid: toggleGrid })
            : []),
        ]}
      />
      {gridOpen && <PageActionsGrid />}
    </>
  );
}
