"use client";

import type { HeaderProps } from "@httpjpg/ui";
import { Header } from "@httpjpg/ui";
import { useTheme } from "../providers/theme-provider";

/**
 * ThemedHeader - Header component that responds to page theme
 * Wraps the base Header and injects isDark from theme context
 */
export function ThemedHeader(props: Omit<HeaderProps, "isDark">) {
  const { isDark } = useTheme();

  return <Header {...props} isDark={isDark} />;
}
