"use client";

import {
  getPageBadgeSlot,
  type PageBadgeSlot,
  PageBadgeCluster,
  registerPageBadgeHost,
  subscribePageBadge,
} from "@httpjpg/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

function DraftChromeContent() {
  const searchParams = useSearchParams();
  const cookiePreview = useSyncExternalStore(
    subscribeNever,
    getDraftCookieSnapshot,
    getServerFalse,
  );
  const slot = useSyncExternalStore(subscribePageBadge, getPageBadgeSlot, getEmptySlot);
  const isDraft =
    cookiePreview ||
    searchParams?.has("_storyblok") === true ||
    searchParams?.has("_draft") === true;

  useEffect(() => {
    if (!isDraft) {
      return;
    }
    return registerPageBadgeHost();
  }, [isDraft]);

  if (!isDraft) {
    return null;
  }

  return (
    <PageBadgeCluster href={slot.href} editHref={slot.editHref} accentColor={slot.accentColor} />
  );
}

export function DraftChrome() {
  return (
    <Suspense fallback={null}>
      <DraftChromeContent />
    </Suspense>
  );
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

function getEmptySlot(): PageBadgeSlot {
  return {};
}
