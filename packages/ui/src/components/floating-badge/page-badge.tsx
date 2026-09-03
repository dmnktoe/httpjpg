"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useEditorChrome } from "./editor-chrome";
import { FloatingBadge, workPreviewAction } from "./floating-badge";

export interface PageBadgeProps {
  /** Work-page live URL. */
  href?: string | null;
  /** Visual Editor href from `_editable`. */
  editHref?: string | null;
  accentColor?: string | null;
}

const PageBadgeContext = createContext<((slot: PageBadgeProps) => void) | null>(null);

function PageBadgeRow({ href, editHref, accentColor }: PageBadgeProps) {
  const editor = useEditorChrome(editHref);
  return (
    <>
      <FloatingBadge
        accentColor={accentColor}
        actions={[...(href ? [workPreviewAction(href)] : []), ...editor.actions]}
      />
      {editor.overlay}
    </>
  );
}

/** Layout host: draws one pill row and swallows nested `PageBadge`s. */
export function PageBadgeProvider({ children }: { children?: ReactNode }) {
  const [slot, setSlot] = useState<PageBadgeProps>({});
  return (
    <PageBadgeContext.Provider value={setSlot}>
      {children}
      <PageBadgeRow {...slot} />
    </PageBadgeContext.Provider>
  );
}

/**
 * Publishes work URL / accent / edit href. Renders pills only when no
 * `PageBadgeProvider` is mounted (tests, Storybook, published work pages).
 */
export function PageBadge({ href, editHref, accentColor }: PageBadgeProps) {
  const setSlot = useContext(PageBadgeContext);

  useEffect(() => {
    if (!setSlot) {
      return;
    }
    setSlot({ href, editHref, accentColor });
    return () => setSlot({});
  }, [setSlot, href, editHref, accentColor]);

  if (setSlot) {
    return null;
  }

  if (editHref) {
    return <PageBadgeRow href={href} editHref={editHref} accentColor={accentColor} />;
  }

  if (href) {
    return <FloatingBadge accentColor={accentColor} actions={[workPreviewAction(href)]} />;
  }

  return null;
}
