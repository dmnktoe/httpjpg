"use client";

import { Box, Button } from "@httpjpg/ui";
import { useEffect, useRef, useState } from "react";

import { setConsent } from "../consent";
import type { ConsentCategory, ConsentState } from "../types";
import { CONSENT_CATEGORIES, DEFAULT_CONSENT_STATE, REQUIRED_CATEGORIES } from "../types";
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
  const externalConsent = useConsent();
  // Seed from the store on first render so saved preferences don't flash back
  // to defaults before the sync effect runs (e.g. on client-side navigation).
  const [consent, setConsentState] = useState<ConsentState>(
    () => externalConsent ?? DEFAULT_CONSENT_STATE,
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<ConsentCategory>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const syncedRef = useRef<ConsentState | null>(externalConsent);

  // Reflect consent changed elsewhere (e.g. the cookie banner on this page),
  // but never clobber unsaved edits, and ignore the echo of our own save.
  useEffect(() => {
    if (!externalConsent) {
      return;
    }
    if (syncedRef.current && consentEquals(externalConsent, syncedRef.current)) {
      return;
    }
    if (hasEdits) {
      return;
    }
    syncedRef.current = externalConsent;
    setConsentState(externalConsent);
    setIsSaved(false);
  }, [externalConsent, hasEdits]);

  const toggleCategory = (category: ConsentCategory) => {
    if (REQUIRED_CATEGORIES.has(category)) {
      return;
    }
    setIsSaved(false);
    setHasEdits(true);
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
    syncedRef.current = next;
    setConsentState(next);
    setConsent(next);
    setIsSaved(true);
    setHasEdits(false);
    onSave?.(next);
  };

  return (
    <Box
      css={{
        p: { base: "5", md: "6" },
        color: "pageFg",
        fontFamily: "sans",
        fontSize: "sm",
        lineHeight: 1.4,
        bg: "pageBg",
        border: "2px solid",
        borderColor: "pageFg",
      }}
    >
      <Box css={{ mb: "4" }}>
        <Box as="span" css={{ color: "primary.500", fontSize: "md", fontWeight: "bold" }}>
          ⇝🍪 ᴄᴏᴏᴋɪᴇ ᴄᴇɴᴛᴇʀ 🍪⇝
        </Box>
        <Box as="p" css={{ m: 0, mt: "2", opacity: 0.8, fontSize: "sm" }}>
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

      <Box css={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "3", mt: "5" }}>
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
          <Box as="output" css={{ color: "success.600", fontSize: "sm", fontWeight: "bold" }}>
            ✓ Preferences saved
          </Box>
        )}
      </Box>
    </Box>
  );
}

function consentEquals(a: ConsentState, b: ConsentState): boolean {
  return CONSENT_CATEGORIES.every((category) => a[category] === b[category]);
}
