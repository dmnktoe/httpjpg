"use client";

import {
  EditorChrome,
  getPreviewBadgeSlot,
  type PreviewBadgeSlot,
  registerPreviewBadgeHost,
  subscribePreviewBadge,
} from "@httpjpg/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

function PreviewNotificationContent() {
  const searchParams = useSearchParams();
  const cookiePreview = useSyncExternalStore(
    subscribeNever,
    getDraftCookieSnapshot,
    getServerFalse,
  );
  const slot = useSyncExternalStore(subscribePreviewBadge, getPreviewBadgeSlot, getEmptySlot);
  const isPreview =
    cookiePreview ||
    searchParams?.has("_storyblok") === true ||
    searchParams?.has("_draft") === true;

  useEffect(() => {
    if (!isPreview) {
      return;
    }
    return registerPreviewBadgeHost();
  }, [isPreview]);

  if (!isPreview) {
    return null;
  }

  return (
    <EditorChrome
      previewHref={slot.previewHref}
      editHref={slot.editHref}
      accentColor={slot.accentColor}
    />
  );
}

export function PreviewNotification() {
  return (
    <Suspense fallback={null}>
      <PreviewNotificationContent />
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

function getEmptySlot(): PreviewBadgeSlot {
  return {};
}
