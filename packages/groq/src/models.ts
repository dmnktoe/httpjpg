/** Groq-hosted chat models this repo calls. */
export const GROQ_MODELS = {
  instant: "llama-3.1-8b-instant",
  versatile: "llama-3.3-70b-versatile",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

export const DEFAULT_GROQ_MODEL: GroqModel = GROQ_MODELS.instant;
