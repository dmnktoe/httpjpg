"use client";

import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface ComponentNotFoundProps {
  /**
   * The name of the component that was not found
   */
  componentName?: string;
  /**
   * Additional CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Component Not Found Error Display
 *
 * Shows a visual error message when a Storyblok component
 * is not found in the component registry.
 *
 * @example
 * ```tsx
 * <ComponentNotFound componentName="UnknownComponent" />
 * ```
 */
export const ComponentNotFound = forwardRef<
  HTMLDivElement,
  ComponentNotFoundProps
>(({ componentName = "Unknown", css: cssProp, ...props }, ref) => {
  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Box
      ref={ref}
      css={{
        padding: "4",
        margin: "4",
        border: "2px solid red",
        borderRadius: "4px",
        backgroundColor: "#fff0f0",
        color: "red",
        fontFamily: "monospace",
        fontSize: "12px",
        ...cssProp,
      }}
      {...props}
    >
      <Box css={{ fontWeight: "bold", marginBottom: "2" }}>
        ⚠️ Component Not Found
      </Box>
      <Box>
        The component <strong>"{componentName}"</strong> is not registered in
        the component system.
      </Box>
      <Box css={{ marginTop: "2", fontSize: "11px", opacity: 0.8 }}>
        Check your Storyblok component registry or component name spelling.
      </Box>
    </Box>
  );
});

ComponentNotFound.displayName = "ComponentNotFound";
