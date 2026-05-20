import { css } from "styled-system/css";

export const globalFocusStyles = css({
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "primary.500",
    outlineOffset: "2px",
  },
});

export const globalStyles = `
  :focus-visible {
    outline: 2px solid var(--colors-primary-500);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }

  ::selection {
    background-color: var(--colors-primary-200);
    color: var(--colors-neutral-900);
  }
`;

export { css } from "styled-system/css";
