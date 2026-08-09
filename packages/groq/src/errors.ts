/**
 * Thrown for any non-2xx response from Groq. Carries the upstream status so
 * route handlers can decide between "retry later" (429/5xx) and "this request
 * was wrong" (4xx) without re-parsing the body.
 */
export class GroqApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GroqApiError";
    this.status = status;
  }

  /** Upstream rate limit or outage — the caller may usefully try again. */
  get isTransient(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

/** Thrown when no API key is configured, so callers can degrade instead of 500. */
export class GroqNotConfiguredError extends Error {
  constructor(message = "GROQ_API_KEY is not configured") {
    super(message);
    this.name = "GroqNotConfiguredError";
  }
}
