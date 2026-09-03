"use client";

import { PageBadgeProvider } from "@httpjpg/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

function DraftQueryDetector({ onChange }: { onChange: (draft: boolean) => void }) {
  const searchParams = useSearchParams();
  const queryDraft =
    searchParams?.has("_storyblok") === true || searchParams?.has("_draft") === true;

  useEffect(() => {
    onChange(queryDraft);
  }, [onChange, queryDraft]);

  return null;
}

function DraftChromeView({ children }: { children?: ReactNode }) {
  const cookieDraft = useSyncExternalStore(subscribeNever, getDraftCookieSnapshot, getServerFalse);
  const [queryDraft, setQueryDraft] = useState(false);
  const isDraft = cookieDraft || queryDraft;

  return (
    <>
      <Suspense fallback={null}>
        <DraftQueryDetector onChange={setQueryDraft} />
      </Suspense>
      {isDraft ? <PageBadgeProvider>{children}</PageBadgeProvider> : children}
    </>
  );
}

export function DraftChrome({ children }: { children?: ReactNode }) {
  return <DraftChromeView>{children}</DraftChromeView>;
}

function subscribeNever() {
  return () => {};
}

function getDraftCookieSnapshot() {
  return document.cookie.includes("__prerender_bypass");
}

function getServerFalse() {
  return false;
}
