"use client";

import type { ConsentCategory, ConsentState } from "../types";
import { CONSENT_CATEGORIES, EXTERNAL_VENDORS, REQUIRED_CATEGORIES } from "../types";
import { CookieCategory, type CookieCategoryVendor } from "./cookie-category";

export interface ConsentCategoryListProps {
  consent: ConsentState;
  expandedCategories: Set<ConsentCategory>;
  onToggle: (category: ConsentCategory) => void;
  onToggleExpansion: (category: ConsentCategory) => void;
}

/** Shared category list rendered by both CookieBanner and CookieCenter. */
export function ConsentCategoryList({
  consent,
  expandedCategories,
  onToggle,
  onToggleExpansion,
}: ConsentCategoryListProps) {
  return (
    <>
      {CONSENT_CATEGORIES.map((category) => {
        const copy = CATEGORY_COPY[category];
        const required = REQUIRED_CATEGORIES.has(category);
        return (
          <CookieCategory
            key={category}
            label={copy.label}
            description={copy.description}
            required={required}
            checked={consent[category]}
            expanded={expandedCategories.has(category)}
            vendors={getCategoryVendors(category)}
            emptyText={copy.emptyText}
            onToggle={required ? undefined : () => onToggle(category)}
            onToggleExpansion={() => onToggleExpansion(category)}
          />
        );
      })}
    </>
  );
}

function getCategoryVendors(category: ConsentCategory): CookieCategoryVendor[] {
  return Object.entries(EXTERNAL_VENDORS)
    .filter(([, vendor]) => vendor.category === category)
    .map(([key, vendor]) => ({ key, ...vendor }));
}

const CATEGORY_COPY: Record<ConsentCategory, CategoryCopy> = {
  preferences: {
    label: "ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ",
    description: "Remembers your settings and preferences. Required for site functionality. ⚙️",
    emptyText: "No external vendors in this category",
  },
  monitoring: {
    label: "ᴍᴏɴɪᴛᴏʀɪɴɢ",
    description: "Error tracking & performance monitoring. Required for site functionality. 🐛",
  },
  analytics: {
    label: "ᴀɴᴀʟʏᴛɪᴄꜱ",
    description: "Helps us understand how visitors interact with our website. 📊",
  },
  media: {
    label: "ᴍᴇᴅɪᴀ & ᴇxᴛᴇʀɴᴀʟ ꜱᴇʀᴠɪᴄᴇꜱ",
    description: "Load external content from video and audio platforms. 🎬🎵",
  },
};

interface CategoryCopy {
  label: string;
  description: string;
  emptyText?: string;
}
