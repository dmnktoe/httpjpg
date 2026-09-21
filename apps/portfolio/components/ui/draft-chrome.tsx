"use client";

import { PageBadgeProvider } from "@httpjpg/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

export interface DraftChromeProps {
  children?: ReactNode;
  /** Server-side Draft Mode (`draftMode().isEnabled`). The bypass cookie is HttpOnly. */
  draftModeEnabled?: boolean;
}

function DraftQueryDetector({ onChange }: { onChange: (draft: boolean) => void }) {
  const searchParams = useSearchParams();
  const queryDraft =
    searchParams?.has("_storyblok") === true || searchParams?.has("_draft") === true;

  useEffect(() => {
    onChange(queryDraft);
  }, [onChange, queryDraft]);

  return null;
}

export function DraftChrome({ children, draftModeEnabled = false }: DraftChromeProps) {
  const [queryDraft, setQueryDraft] = useState(false);
  const isDraft = draftModeEnabled || queryDraft;

  return (
    <>
      <Suspense fallback={null}>
        <DraftQueryDetector onChange={setQueryDraft} />
      </Suspense>
      {isDraft ? <PageBadgeProvider>{children}</PageBadgeProvider> : children}
    </>
  );
}
