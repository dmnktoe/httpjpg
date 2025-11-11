/**
 * Global styles and CSS custom properties
 *
 * Defines CSS custom properties (variables) from design tokens
 * for use throughout the application. These can be used in Linaria
 * styled components as static values.
 */

import { css } from "@linaria/core";

/**
 * Global CSS reset and custom properties
 *
 * Injects design tokens as CSS custom properties and provides
 * a minimal CSS reset for consistent cross-browser styling.
 */
export const globals = css`
  :global() {
    /* CSS Custom Properties from Design Tokens */
    :root {
      /* Colors */
      --color-black: #000000;
      --color-white: #ffffff;
      --color-neutral-50: #fafafa;
      --color-neutral-100: #f5f5f5;
      --color-neutral-200: #e5e5e5;
      --color-neutral-300: #d4d4d4;
      --color-neutral-400: #a3a3a3;
      --color-neutral-500: #737373;
      --color-neutral-600: #525252;
      --color-neutral-700: #404040;
      --color-neutral-800: #262626;
      --color-neutral-900: #171717;
      --color-neutral-950: #0a0a0a;

      /* Spacing (selection) */
      --spacing-1: 0.25rem;
      --spacing-2: 0.5rem;
      --spacing-3: 0.75rem;
      --spacing-4: 1rem;
      --spacing-6: 1.5rem;
      --spacing-8: 2rem;
      --spacing-12: 3rem;
      --spacing-16: 4rem;

      /* Border Radius */
      --radius-sm: 0.125rem;
      --radius-md: 0.25rem;
      --radius-lg: 0.5rem;
      --radius-full: 9999px;

      /* Shadows */
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    }

    /* Minimal CSS Reset */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Focus styles */
    :focus-visible {
      outline: 2px solid var(--color-black);
      outline-offset: 2px;
    }
  }
`;
