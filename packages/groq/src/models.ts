/** Groq-hosted chat models this repo calls. */
export const GROQ_MODELS = {
  instant: "openai/gpt-oss-20b",
  versatile: "openai/gpt-oss-120b",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

export const DEFAULT_GROQ_MODEL: GroqModel = GROQ_MODELS.instant;
