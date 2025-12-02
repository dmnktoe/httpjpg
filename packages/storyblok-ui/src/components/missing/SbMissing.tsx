"use client";

import { Box } from "@httpjpg/ui";
import { memo } from "react";

export interface SbMissingProps {
  /**
   * Storyblok block data
   */
  blok: {
    _uid: string;
    component: string;
    [key: string]: unknown;
  };
}

/**
 * Missing Component Fallback
 *
 * Displays a warning when a Storyblok component is not registered.
 * Useful for development to identify missing component mappings.
 *
 * @example
 * ```tsx
 * // Automatically used by StoryblokComponent when component not found
 * <SbMissing blok={{ component: "unknown-component", _uid: "123" }} />
 * ```
 */
export const SbMissing = memo(function SbMissing({ blok }: SbMissingProps) {
  const componentName = blok.component;

  // In production, return nothing
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // In development, show warning
  return (
    <Box
      css={{
        border: "2px dashed",
        borderColor: "red.500",
        bg: "red.50",
        p: "4",
        my: "4",
        borderRadius: "md",
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      <Box
        css={{
          fontWeight: "bold",
          color: "red.700",
          mb: "2",
        }}
      >
        ⚠️ Missing Storyblok Component
      </Box>

      <Box css={{ color: "red.600", mb: "2" }}>
        Component{" "}
        <Box
          as="code"
          css={{ bg: "red.100", px: "1", py: "0.5", borderRadius: "sm" }}
        >
          "{componentName}"
        </Box>{" "}
        is not registered.
      </Box>

      <Box css={{ fontSize: "xs", color: "red.500", mt: "3" }}>
        To fix this:
        <Box as="ol" css={{ pl: "4", mt: "1" }}>
          <li>
            Create the component in{" "}
            <code>packages/storyblok-ui/src/components/</code>
          </li>
          <li>
            Export it from <code>packages/storyblok-ui/src/index.ts</code>
          </li>
          <li>
            Register it in <code>apps/web/app/storyblok-provider.tsx</code>
          </li>
        </Box>
      </Box>

      {/* Show blok data for debugging */}
      <details style={{ marginTop: "12px" }}>
        <summary style={{ cursor: "pointer", color: "var(--colors-red-600)" }}>
          Show component data
        </summary>
        <Box
          as="pre"
          css={{
            mt: "2",
            p: "2",
            bg: "red.100",
            borderRadius: "sm",
            overflow: "auto",
            fontSize: "xs",
          }}
        >
          {JSON.stringify(blok, null, 2)}
        </Box>
      </details>
    </Box>
  );
});

SbMissing.displayName = "SbMissing";
