"use client";

import { Box, Button } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import { setConsent } from "../consent";
import type { ConsentCategory, ConsentState } from "../types";
import { DEFAULT_CONSENT_STATE, REQUIRED_CATEGORIES } from "../types";
import { useConsent } from "../use-consent";
import { ConsentCategoryList } from "./consent-category-list";

interface CookieCenterProps {
  onSave?: (consent: ConsentState) => void;
}

const FULL_CONSENT: ConsentState = {
  analytics: true,
  monitoring: true,
  preferences: true,
  media: true,
};

/** Inline consent manager for the Cookie Policy page — no portal, saves in place. */
export function CookieCenter({ onSave }: CookieCenterProps) {
  const [consent, setConsentState] = useState<ConsentState>(DEFAULT_CONSENT_STATE);
  const [expandedCategories, setExpandedCategories] = useState<Set<ConsentCategory>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const externalConsent = useConsent();

  // Hydrate from stored consent and stay in sync when it changes elsewhere —
  // e.g. the visitor uses the cookie banner while this page is open.
  useEffect(() => {
    if (externalConsent) {
      setConsentState(externalConsent);
    }
  }, [externalConsent]);

  const toggleCategory = (category: ConsentCategory) => {
    if (REQUIRED_CATEGORIES.has(category)) {
      return;
    }
    setIsSaved(false);
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

  const persist = (next: ConsentState) => {
    setConsentState(next);
    setConsent(next);
    setIsSaved(true);
    onSave?.(next);
  };

  return (
    <Box
      css={{
        bg: "pageBg",
        color: "pageFg",
        border: "2px solid",
        borderColor: "pageFg",
        p: { base: "5", md: "6" },
        fontFamily: "sans",
        fontSize: "sm",
        lineHeight: 1.4,
      }}
    >
      <Box css={{ mb: "4" }}>
        <Box as="span" css={{ fontWeight: "bold", fontSize: "md", color: "primary.500" }}>
          ⇝🍪 ᴄᴏᴏᴋɪᴇ ᴄᴇɴᴛᴇʀ 🍪⇝
        </Box>
        <Box as="p" css={{ m: 0, mt: "2", fontSize: "sm", opacity: 0.8 }}>
          ⋆ﾟ･ Choose which cookies and external services you allow. Required categories keep the site
          working and can't be switched off. ⋆ﾟ･
        </Box>
      </Box>

      <ConsentCategoryList
        consent={consent}
        expandedCategories={expandedCategories}
        onToggle={toggleCategory}
        onToggleExpansion={toggleCategoryExpansion}
      />

      <Box css={{ display: "flex", gap: "3", flexWrap: "wrap", alignItems: "center", mt: "5" }}>
        <Button variant="primary" size="md" onClick={() => persist(FULL_CONSENT)}>
          ✓ Accept All
        </Button>
        <Button variant="secondary" size="md" onClick={() => persist(DEFAULT_CONSENT_STATE)}>
          ✗ Reject All
        </Button>
        <Button variant="accent" size="md" onClick={() => persist(consent)}>
          ⚙ Save Preferences
        </Button>
        {isSaved && (
          <Box as="output" css={{ fontSize: "sm", fontWeight: "bold", color: "success.600" }}>
            ✓ Preferences saved
          </Box>
        )}
      </Box>
    </Box>
  );
}
