"use client";

import { storyblokEditable } from "@storyblok/react/rsc";
import { useEffect, useState } from "react";

/**
 * Custom hook to get storyblokEditable props only on the client
 * This prevents hydration mismatches since storyblokEditable returns null on the server
 */
export function useStoryblokEditable<T extends { _uid: string }>(blok: T) {
  const [editableProps, setEditableProps] = useState<
    Record<string, unknown> | Record<string, never>
  >({});

  useEffect(() => {
    // Only set editable props on the client after mount
    setEditableProps(storyblokEditable(blok) || {});
  }, [blok]);

  return editableProps;
}
