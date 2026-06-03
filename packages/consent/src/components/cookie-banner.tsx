"use client";

import { Box, Button } from "@httpjpg/ui";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { getConsent, hasConsent, setConsent } from "../consent";
import type { ConsentCategory, ConsentState } from "../types";
import { DEFAULT_CONSENT_STATE, EXTERNAL_VENDORS } from "../types";
import { ConsentCategoryList } from "./consent-category-list";

interface CookieBannerProps {
  onAcceptAll?: (consent: ConsentState) => void;
  onRejectAll?: () => void;
  onSavePreferences?: (consent: ConsentState) => void;
}

export function CookieBanner({ onAcceptAll, onRejectAll, onSavePreferences }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<ConsentCategory>>(new Set());
  const [consent, setConsentState] = useState<ConsentState>(DEFAULT_CONSENT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasConsent()) {
      setIsVisible(true);
    } else {
      const savedConsent = getConsent();
      if (savedConsent) {
        setConsentState(savedConsent);
      }
    }

    const handleOpenSettings = () => {
      const savedConsent = getConsent();
      if (savedConsent) {
        setConsentState(savedConsent);
      }
      setShowDetails(true);
      setIsVisible(true);
    };

    window.addEventListener("openCookieSettings", handleOpenSettings);
    return () => window.removeEventListener("openCookieSettings", handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: ConsentState = {
      analytics: true,
      monitoring: true,
      preferences: true,
      media: true,
    };
    setConsent(fullConsent);
    setIsVisible(false);
    onAcceptAll?.(fullConsent);
  };

  const handleRejectAll = () => {
    setConsent(DEFAULT_CONSENT_STATE);
    setIsVisible(false);
    onRejectAll?.();
  };

  const handleSavePreferences = () => {
    setConsent(consent);
    setIsVisible(false);
    onSavePreferences?.(consent);
  };

  const toggleCategory = (category: keyof ConsentState) => {
    if (category === "monitoring" || category === "preferences") {
      return;
    }
    setConsentState((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleCategoryExpansion = (category: ConsentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Count the named third-party services we may hand data to. The catch-all
  // "generic-media" slot isn't a real vendor, so it's excluded from the tally.
  const trustedPartnerCount = Object.keys(EXTERNAL_VENDORS).filter(
    (key) => key !== "generic-media",
  ).length;

  if (!isVisible || !mounted) {
    return null;
  }

  const banner = (
    <Box
      css={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: "cookieBanner",
        bg: "pageBg",
        color: "pageFg",
        borderTop: "2px solid",
        borderTopColor: "primary.500",
        px: { base: "5", md: "10", lg: "16" },
        py: { base: "6", md: "8" },
        fontFamily: "sans",
        fontSize: "md",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        isolation: "isolate",
      }}
    >
      <Box css={{ maxW: "1400px", mx: "auto", lineHeight: 1.4 }}>
        <Box css={{ mb: "5" }}>
          <Box as="span" css={{ fontWeight: "bold", fontSize: "md", color: "primary.500" }}>
            ⇝🍪 ᴄᴏᴏᴋɪᴇ ᴘᴏʟɪᴄʏ 🍪⇝
          </Box>
          <br />
          <Box as="span" css={{ fontSize: "sm", opacity: 0.7 }}>
            ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ &&& ——— 𝒸𝑜𝑜𝓀𝒾𝑒𝓈 𝒸𝑜𝑜𝓀𝒾𝑒𝓈 :)))))
          </Box>
        </Box>

        <Box css={{ mb: "4", fontSize: "sm" }}>
          <Box as="p" css={{ m: 0, mb: "2" }}>
            🎀 ⋆ﾟ･ httpjpg uses personal data collected on this site — such as page visits via
            cookies and other device identifiers — to generate personalized content, store your
            preferences, and analyze usage to improve the experience. ⋆ﾟ･ 🎀
          </Box>
          <Box as="p" css={{ m: 0, mb: "2" }}>
            If you consent, we also let up to{" "}
            <Box as="strong" css={{ fontWeight: "bold", color: "primary.500" }}>
              {trustedPartnerCount} trusted third-party services
            </Box>{" "}
            receive data from this site or store and access cookies on your device to measure
            effectiveness and gain audience insights. You can review each service and its{" "}
            <BannerLink onClick={() => setShowDetails(true)}>Privacy Policy ↗</BannerLink> below.
          </Box>
          <Box as="p" css={{ m: 0 }}>
            By clicking{" "}
            <Box as="strong" css={{ fontWeight: "bold" }}>
              “Accept All”
            </Box>{" "}
            you consent to these activities. Click{" "}
            <Box as="strong" css={{ fontWeight: "bold" }}>
              “Reject All”
            </Box>{" "}
            to object, or <BannerLink onClick={() => setShowDetails(true)}>“Customize”</BannerLink>{" "}
            to make detailed choices and learn more. You can change these settings anytime. 🍪
          </Box>
        </Box>

        {showDetails && (
          <Box
            css={{
              mb: "5",
              p: "4",
              border: "2px solid",
              borderColor: "pageFg",
              bg: "rgba(127,127,127,0.08)",
              fontSize: "sm",
            }}
          >
            <ConsentCategoryList
              consent={consent}
              expandedCategories={expandedCategories}
              onToggle={toggleCategory}
              onToggleExpansion={toggleCategoryExpansion}
            />
          </Box>
        )}

        <Box css={{ display: "flex", gap: "3", flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
            css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
          >
            ✓ Accept All
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRejectAll}
            css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
          >
            ✗ Reject All
          </Button>

          {showDetails ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleSavePreferences}
              css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
            >
              ⚙ Save Preferences
            </Button>
          ) : (
            <Box
              as="button"
              type="button"
              onClick={() => setShowDetails(true)}
              css={{
                appearance: "none",
                background: "none",
                border: "none",
                p: 0,
                color: "pageFg",
                fontFamily: "sans",
                fontSize: "sm",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                _hover: { opacity: 0.7 },
                md: { fontSize: "md" },
              }}
            >
              ⚙ Customize
            </Box>
          )}

          <Box as="span" css={{ fontSize: "xs", opacity: 0.6, ml: "auto" }}>
            ⋆.˚ ᡣ𐭩 .𖥔˚ cookies ⋆.˚✮🍪✮˚.⋆
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return createPortal(banner, document.body);
}

interface BannerLinkProps {
  onClick: () => void;
  children: ReactNode;
}

function BannerLink({ onClick, children }: BannerLinkProps) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      css={{
        appearance: "none",
        background: "none",
        border: "none",
        p: 0,
        color: "primary.500",
        font: "inherit",
        cursor: "pointer",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        _hover: { opacity: 0.7 },
      }}
    >
      {children}
    </Box>
  );
}
