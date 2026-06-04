"use client";

import { Box } from "@httpjpg/ui";
import type { MouseEvent } from "react";

export interface CookieCategoryVendor {
  key: string;
  name: string;
  description: string;
  privacyPolicy?: string;
}

export interface CookieCategoryProps {
  label: string;
  description: string;
  required?: boolean;
  checked: boolean;
  expanded: boolean;
  vendors: CookieCategoryVendor[];
  emptyText?: string;
  onToggle?: () => void;
  onToggleExpansion: () => void;
}

export function CookieCategory({
  label,
  description,
  required = false,
  checked,
  expanded,
  vendors,
  emptyText,
  onToggle,
  onToggleExpansion,
}: CookieCategoryProps) {
  return (
    <Box css={{ mb: "4" }}>
      <Box
        as="label"
        css={{
          display: "flex",
          alignItems: "flex-start",
          opacity: required ? 0.5 : 1,
          cursor: required ? "not-allowed" : "pointer",
        }}
      >
        <Box
          as="input"
          type="checkbox"
          checked={checked}
          disabled={required}
          onChange={onToggle}
          css={{ w: "4", h: "4", mt: "0.5", mr: "3", cursor: required ? "not-allowed" : "pointer" }}
        />
        <Box css={{ flex: 1 }}>
          <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box as="span" css={{ fontWeight: "bold" }}>
              {checked ? "✓" : "☐"} {label}
              {required && " (Required)"}
            </Box>
            <Box
              as="button"
              type="button"
              // The button sits inside the <label>, so a bare click would also
              // toggle the surrounding checkbox. Stop the event before it
              // bubbles to the label.
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleExpansion();
              }}
              css={{
                px: "1",
                opacity: required ? 0.7 : 1,
                fontSize: "sm",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {expanded ? "▼" : "▶"}
            </Box>
          </Box>
          <Box as="span" css={{ opacity: 0.7, fontSize: "xs" }}>
            {description}
          </Box>

          {expanded && (
            <Box css={{ mt: "2", pl: "2", borderColor: "pageBorder", borderLeft: "2px solid" }}>
              {vendors.length > 0
                ? vendors.map((vendor) => (
                    <Box key={vendor.key} css={{ mb: "1.5", fontSize: "xs" }}>
                      <Box css={{ fontWeight: 500 }}>→ {vendor.name}</Box>
                      <Box css={{ ml: "2", opacity: 0.7 }}>
                        {vendor.description}
                        {vendor.privacyPolicy && (
                          <>
                            {" "}
                            <Box
                              as="a"
                              href={vendor.privacyPolicy}
                              target="_blank"
                              rel="noopener noreferrer"
                              css={{ textDecoration: "underline" }}
                            >
                              Privacy Policy ↗
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))
                : emptyText && <Box css={{ opacity: 0.6, fontSize: "xs" }}>{emptyText}</Box>}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
