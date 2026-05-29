"use client";

import { useConsentManager, useFocusTrap, useHeadlessConsentUI } from "@c15t/nextjs/headless";
import { Box, Button } from "@httpjpg/ui";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { mapC15tToConsentState } from "../consent";
import type { ConsentCategory, ConsentState } from "../types";
import { CATEGORY_TO_C15T, EXTERNAL_VENDORS } from "../types";
import { CookieCategory, type CookieCategoryVendor } from "./cookie-category";

interface CookieBannerProps {
  onAcceptAll?: (consent: ConsentState) => void;
  onRejectAll?: () => void;
  onSavePreferences?: (consent: ConsentState) => void;
}

export function CookieBanner({ onAcceptAll, onRejectAll, onSavePreferences }: CookieBannerProps) {
  const { selectedConsents, setSelectedConsent } = useConsentManager();

  const { activeUI, performBannerAction, saveCustomPreferences, openBanner } =
    useHeadlessConsentUI();

  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<ConsentCategory>>(new Set());
  const [mounted, setMounted] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowDetails(true);
      openBanner({ force: true });
    };

    window.addEventListener("openCookieSettings", handleOpenSettings);
    return () => window.removeEventListener("openCookieSettings", handleOpenSettings);
  }, [openBanner]);

  const handleAcceptAll = async () => {
    await performBannerAction("accept");
    const mapped = mapC15tToConsentState({
      necessary: true,
      functionality: true,
      measurement: true,
      experience: true,
      marketing: true,
    });
    onAcceptAll?.(mapped);
    window.dispatchEvent(new CustomEvent("consentChange", { detail: mapped }));
  };

  const handleRejectAll = async () => {
    await performBannerAction("reject");
    onRejectAll?.();
    const mapped = mapC15tToConsentState({
      necessary: true,
      functionality: true,
      measurement: false,
      experience: false,
      marketing: false,
    });
    window.dispatchEvent(new CustomEvent("consentChange", { detail: mapped }));
  };

  const handleSavePreferences = async () => {
    await saveCustomPreferences();
    const mapped = mapC15tToConsentState(selectedConsents as unknown as Record<string, boolean>);
    onSavePreferences?.(mapped);
    window.dispatchEvent(new CustomEvent("consentChange", { detail: mapped }));
  };

  const toggleCategory = (category: ConsentCategory) => {
    if (category === "preferences") {
      return;
    }
    const c15tName = CATEGORY_TO_C15T[category];
    const current = (selectedConsents as unknown as Record<string, boolean>)[c15tName] ?? false;
    setSelectedConsent(c15tName, !current);
  };

  const isCategoryChecked = (category: ConsentCategory): boolean => {
    const c15tName = CATEGORY_TO_C15T[category];
    if (category === "preferences") {
      return true;
    }
    return (selectedConsents as unknown as Record<string, boolean>)[c15tName] ?? false;
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

  const getCategoryVendors = (category: ConsentCategory): CookieCategoryVendor[] =>
    Object.entries(EXTERNAL_VENDORS)
      .filter(([_, vendor]) => vendor.category === category)
      .map(([key, vendor]) => ({ key, ...vendor }));

  const isVisible = activeUI === "banner";

  useFocusTrap(mounted && isVisible, bannerRef);

  if (!isVisible || !mounted) {
    return null;
  }

  const banner = (
    <Box
      as="section"
      ref={bannerRef}
      aria-label="Cookie consent preferences"
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
            🎀 ⋆ﾟ･ We use cookies for analytics & monitoring. You can customize your preferences
            below. ⋆ﾟ･ 🎀
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
            <CookieCategory
              label="ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ"
              description="Remembers your settings and preferences. Required for site functionality. ⚙️"
              required
              checked={isCategoryChecked("preferences")}
              expanded={expandedCategories.has("preferences")}
              vendors={getCategoryVendors("preferences")}
              emptyText="No external vendors in this category"
              onToggleExpansion={() => toggleCategoryExpansion("preferences")}
            />
            <CookieCategory
              label="ᴍᴏɴɪᴛᴏʀɪɴɢ"
              description="Error tracking & performance monitoring to keep the site stable. 🐛"
              checked={isCategoryChecked("monitoring")}
              onToggle={() => toggleCategory("monitoring")}
              expanded={expandedCategories.has("monitoring")}
              vendors={getCategoryVendors("monitoring")}
              onToggleExpansion={() => toggleCategoryExpansion("monitoring")}
            />
            <CookieCategory
              label="ᴀɴᴀʟʏᴛɪᴄꜱ"
              description="Helps us understand how visitors interact with our website. 📊"
              checked={isCategoryChecked("analytics")}
              expanded={expandedCategories.has("analytics")}
              vendors={getCategoryVendors("analytics")}
              onToggle={() => toggleCategory("analytics")}
              onToggleExpansion={() => toggleCategoryExpansion("analytics")}
            />
            <Box css={{ mb: 0 }}>
              <CookieCategory
                label="ᴍᴇᴅɪᴀ & ᴇxᴛᴇʀɴᴀʟ ꜱᴇʀᴠɪᴄᴇꜱ"
                description="Load external content from video and audio platforms. 🎬🎵"
                checked={isCategoryChecked("media")}
                expanded={expandedCategories.has("media")}
                vendors={getCategoryVendors("media")}
                onToggle={() => toggleCategory("media")}
                onToggleExpansion={() => toggleCategoryExpansion("media")}
              />
            </Box>
          </Box>
        )}

        <Box css={{ display: "flex", gap: "3", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary" size="sm" onClick={handleAcceptAll}>
            ✓ Accept All
          </Button>

          <Button variant="danger" size="sm" onClick={handleRejectAll}>
            ✗ Reject All
          </Button>

          {showDetails ? (
            <Button variant="secondary" size="sm" onClick={handleSavePreferences}>
              ⚙ Save Preferences
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
              ⚙ Customize
            </Button>
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
