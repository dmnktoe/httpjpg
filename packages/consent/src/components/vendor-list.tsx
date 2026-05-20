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
    <Box
      css={{
        fontFamily: "mono",
        fontSize: "sm",
        color: "neutral.700",
      }}
    >
      <Divider variant="ascii" pattern={dividerPattern} spacing="3" />

      <Box css={{ mt: "3" }}>
        <Box
          css={{
            fontWeight: 600,
            mb: "3",
            fontSize: "sm",
          }}
        >
          ✦ External Services Used:
        </Box>

        {Object.entries(vendorsByCategory).map(([category, vendors]) => (
          <Box key={category} css={{ mb: "4" }}>
            <Box
              css={{
                fontWeight: 600,
                fontSize: "xs",
                color: "neutral.600",
                mb: "2",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {categoryLabels[category] || category}
            </Box>

            <Box
              as="ul"
              css={{
                listStyle: "none",
                p: 0,
                m: 0,
                display: "flex",
                flexDirection: "column",
                gap: "2",
              }}
            >
              {vendors.map((vendor) => (
                <Box
                  as="li"
                  key={vendor.key}
                  css={{
                    pl: "4",
                    position: "relative",
                  }}
                >
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
