/**
 * Groq-hosted models this repo is willing to call. Groq rotates its catalogue
 * faster than a dependency bump cycle, so the map is deliberately small: the
 * two chat models the site actually uses, plus a default the env layer falls
 * back to when `GROQ_MODEL` is unset.
 */
export const GROQ_MODELS = {
  /** Fast, cheap, good enough for grounded Q&A over a handful of excerpts. */
  instant: "llama-3.1-8b-instant",
  /** Slower and more capable — kept for answers that need real synthesis. */
  versatile: "llama-3.3-70b-versatile",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

export const DEFAULT_GROQ_MODEL: GroqModel = GROQ_MODELS.instant;
