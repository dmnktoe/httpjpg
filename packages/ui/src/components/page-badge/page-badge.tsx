"use client";

import { useEffect, useSyncExternalStore } from "react";

import { FloatingBadge } from "../floating-badge/floating-badge";
import { workPreviewAction } from "../floating-badge/work-preview-action";
import { PageBadgeCluster } from "./page-badge-cluster";
import { getPageBadgeHosted, setPageBadgeSlot, subscribePageBadge } from "./page-badge-store";

export interface PageBadgeProps {
  /** Work-page live URL. */
  href?: string | null;
  /** Visual Editor href from `_editable`. */
  editHref?: string | null;
  accentColor?: string | null;
}

function getServerFalse() {
  return false;
}

/**
 * Pages publish work URL / accent / edit href to the layout `DraftChrome` host.
 * Without a host: a live URL renders the work pill; `_editable` renders draft chrome.
 */
export function PageBadge({ href, editHref, accentColor }: PageBadgeProps) {
  const hosted = useSyncExternalStore(subscribePageBadge, getPageBadgeHosted, getServerFalse);

  useEffect(() => {
    setPageBadgeSlot({
      href: href ?? undefined,
      editHref,
      accentColor,
    });
    return () => setPageBadgeSlot({});
  }, [href, editHref, accentColor]);

  if (hosted) {
    return null;
  }

  if (editHref) {
    return (
      <PageBadgeCluster href={href ?? undefined} editHref={editHref} accentColor={accentColor} />
    );
  }

  if (href) {
    return <FloatingBadge accentColor={accentColor} actions={[workPreviewAction(href)]} />;
  }

  return null;
}
