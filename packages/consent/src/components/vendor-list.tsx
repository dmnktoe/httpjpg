"use client";

import { ASCII_SPARKLES, Box, Divider } from "@httpjpg/ui";
import { useMemo } from "react";

import { EXTERNAL_VENDORS, type ExternalVendor } from "../types";

export interface VendorListProps {
  vendors?: ExternalVendor[];
  showPrivacyLinks?: boolean;
  dividerPattern?: string;
}

export function VendorList({
  vendors,
  showPrivacyLinks = true,
  dividerPattern = ASCII_SPARKLES,
}: VendorListProps) {
  const vendorsByCategory = useMemo(() => {
    const keys = vendors || (Object.keys(EXTERNAL_VENDORS) as ExternalVendor[]);
    const filtered = keys
      .map((key) => ({
        key,
        ...EXTERNAL_VENDORS[key],
      }))
      .filter((v) => v.key !== "generic-media");

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
    <Box css={{ color: "neutral.700", fontFamily: "mono", fontSize: "sm" }}>
      <Divider variant="ascii" pattern={dividerPattern} spacing="3" />

      <Box css={{ mt: "3" }}>
        <Box css={{ mb: "3", fontSize: "sm", fontWeight: 600 }}>✦ External Services Used:</Box>

        {Object.entries(vendorsByCategory).map(([category, vendors]) => (
          <Box key={category} css={{ mb: "4" }}>
            <Box
              css={{
                mb: "2",
                color: "neutral.600",
                fontSize: "xs",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {categoryLabels[category] || category}
            </Box>

            <Box
              as="ul"
              css={{
                display: "flex",
                flexDirection: "column",
                gap: "2",
                m: 0,
                p: 0,
                listStyle: "none",
              }}
            >
              {vendors.map((vendor) => (
                <Box as="li" key={vendor.key} css={{ position: "relative", pl: "4" }}>
                  <Box
                    as="span"
                    css={{
                      position: "absolute",
                      left: 0,
                      color: "neutral.500",
                    }}
                  >
                    ･
                  </Box>
                  <strong>{vendor.name}</strong>
                  {" - "}
                  {vendor.description}
                  {showPrivacyLinks && vendor.privacyPolicy && (
                    <>
                      {" "}
                      <Box
                        as="a"
                        href={vendor.privacyPolicy}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{
                          color: "primary.600",
                          textDecoration: "underline",
                        }}
                      >
                        Privacy Policy ↗
                      </Box>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Divider variant="ascii" pattern={dividerPattern} spacing="3" />
    </Box>
  );
}
