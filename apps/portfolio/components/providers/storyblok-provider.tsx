"use client";

import "@/lib/storyblok";
import type { ReactNode } from "react";

export function StoryblokProvider({ children }: { children: ReactNode }) {
  return children;
}
