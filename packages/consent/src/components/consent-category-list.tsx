"use client";

import type { ConsentCategory, ConsentState } from "../types";
import { EXTERNAL_VENDORS } from "../types";
import { CookieCategory, type CookieCategoryVendor } from "./cookie-category";

export interface ConsentCategoryListProps {
  consent: ConsentState;
  expandedCategories: Set<ConsentCategory>;
  onToggle: (category: ConsentCategory) => void;
  onToggleExpansion: (category: ConsentCategory) => void;
}

/**
 * Shared, presentational list of consent categories. Both the fixed
 * `CookieBanner` and the inline `CookieCenter` render it so the category
 * copy and vendor grouping live in exactly one place.
 */
export function ConsentCategoryList({
  consent,
  expandedCategories,
  onToggle,
  onToggleExpansion,
}: ConsentCategoryListProps) {
  return (
    <>
      {CATEGORY_ORDER.map((category) => {
        const copy = CATEGORY_COPY[category];
        return (
          <CookieCategory
            key={category}
            label={copy.label}
            description={copy.description}
            required={copy.required}
            checked={consent[category]}
            expanded={expandedCategories.has(category)}
            vendors={getCategoryVendors(category)}
            emptyText={copy.emptyText}
            onToggle={copy.required ? undefined : () => onToggle(category)}
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

const CATEGORY_ORDER: ConsentCategory[] = ["preferences", "monitoring", "analytics", "media"];

const CATEGORY_COPY: Record<ConsentCategory, CategoryCopy> = {
  preferences: {
    label: "ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ",
    description: "Remembers your settings and preferences. Required for site functionality. ⚙️",
    required: true,
    emptyText: "No external vendors in this category",
  },
  monitoring: {
    label: "ᴍᴏɴɪᴛᴏʀɪɴɢ",
    description: "Error tracking & performance monitoring. Required for site functionality. 🐛",
    required: true,
  },
  analytics: {
    label: "ᴀɴᴀʟʏᴛɪᴄꜱ",
    description: "Helps us understand how visitors interact with our website. 📊",
    required: false,
  },
  media: {
    label: "ᴍᴇᴅɪᴀ & ᴇxᴛᴇʀɴᴀʟ ꜱᴇʀᴠɪᴄᴇꜱ",
    description: "Load external content from video and audio platforms. 🎬🎵",
    required: false,
  },
};

interface CategoryCopy {
  label: string;
  description: string;
  required: boolean;
  emptyText?: string;
}
