"use client";

import { Box, Checkbox } from "@httpjpg/ui";
import { useId } from "react";
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
  const inputId = useId();
  return (
    <Box css={{ mb: "4" }}>
      <Box
        css={{
          display: "flex",
          alignItems: "flex-start",
          opacity: required ? 0.5 : 1,
        }}
      >
        <Checkbox
          id={inputId}
          checked={checked}
          disabled={required}
          onCheckedChange={onToggle}
          css={{ mr: "2", ...(required && { opacity: 1 }) }}
        />
        <Box css={{ flex: 1 }}>
          <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box
              as="label"
              htmlFor={inputId}
              css={{
                fontWeight: "bold",
                cursor: required ? "not-allowed" : "pointer",
              }}
            >
              {label}
              {required && " (Required)"}
            </Box>
            <Box
              as="button"
              type="button"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
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
