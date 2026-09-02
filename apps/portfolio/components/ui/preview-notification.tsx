"use client";

import {
  editorBadgeActions,
  FloatingPreviewBadge,
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
    <FloatingPreviewBadge
      href={slot.previewHref}
      accentColor={slot.accentColor}
      gridToggle
      actions={editorBadgeActions(slot.editHref)}
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
