/**
 * Transition design tokens
 * Standard transition timings and easings
 */

export const transitions = {
  duration: {
    fast: "0.1s",
    normal: "0.2s",
    slow: "0.3s",
    slower: "0.5s",
  },
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const;

export type Transitions = typeof transitions;
