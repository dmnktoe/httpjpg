"use client";

import { Footer } from "@httpjpg/ui";

interface FooterWrapperProps {
  backgroundImage?: string;
  footerLinks?: Array<{
    name: string;
    href: string;
    isExternal?: boolean;
  }>;
  copyrightText?: string;
}

export function FooterWrapper({
  backgroundImage,
  footerLinks,
  copyrightText,
}: FooterWrapperProps) {
  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  return (
    <Footer
      backgroundImage={backgroundImage}
      footerLinks={footerLinks}
      copyrightText={copyrightText}
      onCookieSettingsClick={handleCookieSettingsClick}
    />
  );
}
