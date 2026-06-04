"use client";

import { Box, Checkbox } from "@httpjpg/ui";
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
        css={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2" }}
      >
        <Checkbox
          checked={checked}
          disabled={required}
          onCheckedChange={onToggle ? () => onToggle() : undefined}
          label={
            <Box as="span" css={{ fontWeight: "bold" }}>
              {label}
              {required && " (Required)"}
            </Box>
          }
        />
        <Box
          as="button"
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpansion();
          }}
          css={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "sm",
            px: "1",
            opacity: required ? 0.7 : 1,
          }}
        >
          {expanded ? "▼" : "▶"}
        </Box>
      </Box>
      <Box as="p" css={{ fontSize: "xs", opacity: 0.7, mt: "1", ml: "8" }}>
        {description}
      </Box>

      {expanded && (
        <Box
          css={{ mt: "2", ml: "8", pl: "2", borderLeft: "2px solid", borderColor: "pageBorder" }}
        >
          {vendors.length > 0
            ? vendors.map((vendor) => (
                <Box key={vendor.key} css={{ mb: "1.5", fontSize: "xs" }}>
                  <Box css={{ fontWeight: 500 }}>→ {vendor.name}</Box>
                  <Box css={{ opacity: 0.7, ml: "2" }}>
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
  );
}
