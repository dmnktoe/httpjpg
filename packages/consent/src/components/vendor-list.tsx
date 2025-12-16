"use client";

import { Divider } from "@httpjpg/ui";
import { useMemo } from "react";
import { EXTERNAL_VENDORS, type ExternalVendor } from "../types";

export interface VendorListProps {
  /**
   * Vendors to display in the list
   * If not provided, all vendors will be displayed
   */
  vendors?: ExternalVendor[];
  /**
   * Show privacy policy links
   * @default true
   */
  showPrivacyLinks?: boolean;
  /**
   * Custom divider pattern
   * @default "･ﾟ⋆ ✦ ･ﾟ⋆"
   */
  dividerPattern?: string;
}

/**
 * VendorList - Display list of external services requiring consent
 *
 * Shows a formatted list of external vendors (YouTube, Vimeo, Spotify, SoundCloud)
 * with their descriptions and privacy policy links. Uses ASCII dividers for
 * brutalist aesthetic.
 *
 * @example
 * ```tsx
 * <VendorList />
 * ```
 *
 * @example
 * ```tsx
 * <VendorList
 *   vendors={['youtube', 'spotify']}
 *   dividerPattern="✦ ･ﾟ⋆ ✦"
 * />
 * ```
 */
export function VendorList({
  vendors,
  showPrivacyLinks = true,
  dividerPattern = "･ﾟ⋆ ✦ ･ﾟ⋆",
}: VendorListProps) {
  const vendorsByCategory = useMemo(() => {
    const keys = vendors || (Object.keys(EXTERNAL_VENDORS) as ExternalVendor[]);
    const filtered = keys
      .map((key) => ({
        key,
        ...EXTERNAL_VENDORS[key],
      }))
      .filter((v) => v.key !== "generic-media"); // Hide generic media from list

    // Group by category
    const grouped: Record<string, typeof filtered> = {};
    for (const vendor of filtered) {
      if (!grouped[vendor.category]) {
        grouped[vendor.category] = [];
      }
      grouped[vendor.category].push(vendor);
    }

    return grouped;
  }, [vendors]);

  const hasVendors = Object.keys(vendorsByCategory).length > 0;

  if (!hasVendors) {
    return null;
  }

  const categoryLabels: Record<string, string> = {
    analytics: "📊 Analytics",
    monitoring: "🐛 Monitoring & Error Tracking",
    media: "🎬 Media & Content",
    preferences: "⚙️ Preferences",
  };

  return (
    <div
      style={{
        fontFamily: "var(--fonts-mono)",
        fontSize: "var(--font-sizes-sm)",
        color: "var(--colors-neutral-700)",
      }}
    >
      <Divider variant="ascii" pattern={dividerPattern} spacing="3" />

      <div style={{ marginTop: "var(--spacing-3)" }}>
        <div
          style={{
            fontWeight: "600",
            marginBottom: "var(--spacing-3)",
            fontSize: "var(--font-sizes-sm)",
          }}
        >
          ✦ External Services Used:
        </div>

        {Object.entries(vendorsByCategory).map(([category, vendors]) => (
          <div key={category} style={{ marginBottom: "var(--spacing-4)" }}>
            <div
              style={{
                fontWeight: "600",
                fontSize: "var(--font-sizes-xs)",
                color: "var(--colors-neutral-600)",
                marginBottom: "var(--spacing-2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {categoryLabels[category] || category}
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-2)",
              }}
            >
              {vendors.map((vendor) => (
                <li
                  key={vendor.key}
                  style={{
                    paddingLeft: "var(--spacing-4)",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: "var(--colors-neutral-500)",
                    }}
                  >
                    ･
                  </span>
                  <strong>{vendor.name}</strong>
                  {" - "}
                  {vendor.description}
                  {showPrivacyLinks && vendor.privacyPolicy && (
                    <>
                      {" "}
                      <a
                        href={vendor.privacyPolicy}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--colors-primary-600)",
                          textDecoration: "underline",
                        }}
                      >
                        Privacy Policy ↗
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Divider variant="ascii" pattern={dividerPattern} spacing="3" />
    </div>
  );
}
