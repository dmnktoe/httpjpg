"use client";

import { FloatingBadge } from "../floating-badge/floating-badge";
import { draftActions, workPreviewAction } from "./lib";
import type { PageBadgeProps } from "./page-badge";
import { PageBadgeGrid, useGridShortcut } from "./page-badge-grid";

interface PageBadgeRowProps extends PageBadgeProps {
  draft?: boolean;
  inEditor?: boolean;
}

/** Live URL (accented) + draft tools in one row. Draft content always gets the tools. */
export function PageBadgeRow({
  href,
  editHref,
  accentColor,
  draft = false,
  inEditor = false,
}: PageBadgeRowProps) {
  const showDraftTools = draft || Boolean(editHref);
  const [gridOpen, toggleGrid] = useGridShortcut(showDraftTools);

  return (
    <>
      <FloatingBadge
        accentColor={accentColor}
        actions={[
          ...(href ? [workPreviewAction(href)] : []),
          ...(showDraftTools
            ? draftActions({ editHref, inEditor, gridOpen, onToggleGrid: toggleGrid })
            : []),
        ]}
      />
      {gridOpen && <PageBadgeGrid />}
    </>
  );
}
