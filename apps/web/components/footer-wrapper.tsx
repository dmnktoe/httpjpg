"use client";

import { Footer } from "@httpjpg/ui";

interface FooterWrapperProps {
  backgroundImage?: string;
  showDefaultLinks?: boolean;
  copyrightText?: string;
}

export function FooterWrapper({
  backgroundImage,
  showDefaultLinks,
  copyrightText,
}: FooterWrapperProps) {
  const handleCookieSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("openCookieSettings"));
  };

  return (
    <Footer
      backgroundImage={backgroundImage}
      showDefaultLinks={showDefaultLinks}
      copyrightText={copyrightText}
      onCookieSettingsClick={handleCookieSettingsClick}
    />
  );
}
