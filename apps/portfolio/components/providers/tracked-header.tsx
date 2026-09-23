"use client";

import { trackNavClick } from "@httpjpg/analytics";
import { Header, type HeaderProps } from "@httpjpg/ui";

/** Server-layout-safe Header that fans nav clicks into Umami. */
export function TrackedHeader(props: Omit<HeaderProps, "onNavClick">) {
  return <Header {...props} onNavClick={trackNavClick} />;
}
