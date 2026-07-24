export interface OverlayParticle {
  char: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** Multiplier for the base font size (defaults to 1). */
  scale?: number;
  /** Animation delay so particles don't pulse in sync. */
  delay?: string;
  /** Tilt in degrees. */
  rotate?: number;
  /** Opacity (0–1). */
  opacity?: number;
}

export type OverlayPattern =
  | "none"
  | "random"
  | "stars"
  | "sparkles"
  | "hearts"
  | "confetti"
  | "tape"
  | "dots"
  | "arrows"
  | "ghost"
  | "bracket"
  | "noise"
  | "runes";

export const OVERLAY_PATTERNS: Record<
  Exclude<OverlayPattern, "none" | "random">,
  OverlayParticle[]
> = {
  stars: [
    { char: "✦", top: "-10px", left: "-8px", scale: 1.2, delay: "0s", rotate: -10 },
    { char: "✧", top: "20%", right: "-12px", scale: 0.9, delay: "0.4s", rotate: 8 },
    { char: "⋆", bottom: "-10px", right: "20%", scale: 1.1, delay: "0.8s", rotate: 15 },
    { char: "✦", bottom: "10%", left: "-10px", scale: 0.85, delay: "1.2s", rotate: -20 },
    { char: "☆", top: "-12px", right: "30%", scale: 1, delay: "1.6s" },
  ],
  sparkles: [
    { char: "·°", top: "-8px", left: "10%", scale: 0.9, delay: "0s" },
    { char: "⋆", top: "5%", right: "-6px", scale: 1.3, delay: "0.3s", rotate: 12 },
    { char: "·", bottom: "15%", left: "-4px", scale: 1.4, delay: "0.6s" },
    { char: "°.", bottom: "-6px", right: "15%", scale: 1, delay: "0.9s", rotate: -8 },
    { char: "✦", top: "40%", left: "-8px", scale: 0.8, delay: "1.2s" },
    { char: "˚", top: "60%", right: "-4px", scale: 1.5, delay: "1.5s" },
  ],
  hearts: [
    { char: "♡", top: "-10px", left: "20%", scale: 1, delay: "0s", rotate: -15 },
    { char: "♥", bottom: "-10px", right: "25%", scale: 0.85, delay: "0.5s", rotate: 12 },
    { char: "♡", top: "50%", left: "-12px", scale: 0.9, delay: "1s", rotate: -25 },
    { char: "♥", top: "20%", right: "-8px", scale: 1.1, delay: "1.5s", rotate: 8 },
  ],
  confetti: [
    { char: "◆", top: "-10px", left: "15%", scale: 0.7, delay: "0s", rotate: 45 },
    { char: "◇", top: "10%", right: "-8px", scale: 0.9, delay: "0.2s", rotate: 30 },
    { char: "✦", bottom: "-8px", left: "30%", scale: 1.1, delay: "0.4s", rotate: -10 },
    { char: "⬥", bottom: "20%", right: "-10px", scale: 0.8, delay: "0.6s", rotate: 60 },
    { char: "✧", top: "55%", left: "-6px", scale: 1, delay: "0.8s" },
    { char: "⬦", top: "-6px", right: "35%", scale: 0.75, delay: "1s", rotate: -45 },
    { char: "◈", bottom: "40%", left: "-10px", scale: 0.95, delay: "1.2s" },
  ],
  tape: [
    { char: "▰▱▰▱▰▱", top: "-14px", left: "-4px", scale: 0.5, delay: "0s", opacity: 0.7 },
    { char: "▱▰▱▰▱▰", bottom: "-14px", right: "-4px", scale: 0.5, delay: "0.6s", opacity: 0.7 },
  ],
  dots: [
    { char: "·", top: "-6px", left: "10%", scale: 2, delay: "0s" },
    { char: "·", top: "-4px", left: "30%", scale: 1.4, delay: "0.3s" },
    { char: "·", top: "-8px", left: "60%", scale: 1.8, delay: "0.6s" },
    { char: "·", bottom: "-6px", right: "15%", scale: 2, delay: "0.9s" },
    { char: "·", bottom: "-4px", right: "40%", scale: 1.5, delay: "1.2s" },
    { char: "·", bottom: "-8px", right: "65%", scale: 1.7, delay: "1.5s" },
  ],
  arrows: [
    { char: "↖", top: "-12px", left: "-8px", scale: 1.1, delay: "0s" },
    { char: "↗", top: "-12px", right: "-8px", scale: 1.1, delay: "0.4s" },
    { char: "↙", bottom: "-12px", left: "-8px", scale: 1.1, delay: "0.8s" },
    { char: "↘", bottom: "-12px", right: "-8px", scale: 1.1, delay: "1.2s" },
  ],
  ghost: [
    { char: "( o.o )", top: "-22px", right: "8%", scale: 0.7, delay: "0s", opacity: 0.6 },
    { char: "·°", bottom: "10%", left: "-8px", scale: 1.2, delay: "0.6s" },
    { char: "⋆", top: "40%", right: "-6px", scale: 1, delay: "1.2s" },
  ],
  bracket: [
    { char: "┌", top: "-6px", left: "-6px", scale: 1.4, delay: "0s" },
    { char: "┐", top: "-6px", right: "-6px", scale: 1.4, delay: "0.2s" },
    { char: "└", bottom: "-6px", left: "-6px", scale: 1.4, delay: "0.4s" },
    { char: "┘", bottom: "-6px", right: "-6px", scale: 1.4, delay: "0.6s" },
    { char: "·", top: "-4px", left: "50%", scale: 1, delay: "0.8s", opacity: 0.6 },
    { char: "·", bottom: "-4px", right: "50%", scale: 1, delay: "1s", opacity: 0.6 },
  ],
  noise: [
    { char: "▓", top: "-8px", left: "8%", scale: 0.7, delay: "0s", opacity: 0.55 },
    { char: "▒", top: "-6px", left: "30%", scale: 0.9, delay: "0.2s", opacity: 0.5 },
    { char: "░", top: "-4px", right: "20%", scale: 1.1, delay: "0.4s", opacity: 0.45 },
    { char: "▓", top: "55%", left: "-10px", scale: 0.8, delay: "0.6s", opacity: 0.55 },
    { char: "▒", top: "35%", right: "-8px", scale: 1, delay: "0.8s", opacity: 0.5 },
    { char: "░", bottom: "-6px", left: "22%", scale: 1.2, delay: "1s", opacity: 0.45 },
    { char: "▓", bottom: "-8px", right: "10%", scale: 0.75, delay: "1.2s", opacity: 0.55 },
    { char: "▒", bottom: "30%", left: "-6px", scale: 0.9, delay: "1.4s", opacity: 0.5 },
  ],
  runes: [
    { char: "ᚲ", top: "-12px", left: "12%", scale: 1, delay: "0s", rotate: -8 },
    { char: "ᛒ", top: "20%", right: "-10px", scale: 1.1, delay: "0.4s", rotate: 10 },
    { char: "ᛁ", bottom: "10%", left: "-8px", scale: 0.9, delay: "0.8s" },
    { char: "ᚦ", bottom: "-10px", right: "25%", scale: 1, delay: "1.2s", rotate: -12 },
    { char: "ᛟ", top: "55%", left: "-10px", scale: 0.85, delay: "1.6s", rotate: 15 },
  ],
};

const PATTERN_ROTATION: Array<Exclude<OverlayPattern, "none" | "random">> = [
  "stars",
  "sparkles",
  "hearts",
  "confetti",
  "tape",
  "dots",
  "arrows",
  "ghost",
  "bracket",
  "noise",
  "runes",
];

/**
 * Deterministically pick a pattern from a seed string. Same seed always
 * returns the same pattern, so each Storyblok image keeps its own flavor
 * across re-renders.
 */
export function pickPattern(seed: string | undefined): Exclude<OverlayPattern, "none" | "random"> {
  if (!seed) {
    return PATTERN_ROTATION[0];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PATTERN_ROTATION[hash % PATTERN_ROTATION.length];
}
