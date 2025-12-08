"use client";

import { Footer } from "@httpjpg/ui";
import { useTheme } from "../providers/theme-provider";

interface ThemedFooterProps {
  backgroundImage?: string;
  footerLinks?: Array<{
    name: string;
    href: string;
    isExternal?: boolean;
  }>;
  copyrightText?: string;
}

/**
 * ThemedFooter - Footer component that responds to page theme
 * Wraps Footer and injects isDark from theme context
 */
export function ThemedFooter(props: ThemedFooterProps) {
  const { isDark } = useTheme();

  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  return (
    <Footer
      {...props}
      isDark={isDark}
      onCookieSettingsClick={handleCookieSettingsClick}
    />
  );
}
