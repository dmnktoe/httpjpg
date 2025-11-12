/**
 * @httpjpg/ui Global Styles
 *
 * This file exports Panda CSS global styles that should be imported
 * once in your Next.js app layout or _app file.
 *
 * @example
 * ```tsx
 * // In your app/layout.tsx or pages/_app.tsx
 * import "@httpjpg/ui/styles/global";
 * ```
 */

import { css } from "styled-system/css";

/**
 * Global CSS class for focus-visible styling
 * Applied to all interactive elements
 */
export const globalFocusStyles = css({
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "primary.500",
    outlineOffset: "2px",
  },
});

/**
 * CSS string for global styles injection
 * Use this if you need to inject styles programmatically
 */
export const globalStyles = `
  /* Focus visible for accessibility */
  :focus-visible {
    outline: 2px solid var(--colors-primary-500);
    outline-offset: 2px;
  }

  /* Smooth scrolling */
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }

  /* Selection styling */
  ::selection {
    background-color: var(--colors-primary-200);
    color: var(--colors-neutral-900);
  }
`;

/**
 * Re-export Panda CSS global styles
 * This ensures the CSS reset and base styles are included
 */
export { css } from "styled-system/css";
