"use client";

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
 * Wraps FooterWrapper and injects isDark from theme context
 */
export function ThemedFooter(props: ThemedFooterProps) {
  const { isDark } = useTheme();

  // Dynamically import Footer to avoid circular dependencies
  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  // Import Footer from @httpjpg/ui
  const { Footer } = require("@httpjpg/ui");

  return (
    <Footer
      {...props}
      isDark={isDark}
      onCookieSettingsClick={handleCookieSettingsClick}
    />
  );
}
