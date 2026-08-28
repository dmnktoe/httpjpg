import { NextResponse } from "next/server";

/**
 * Machine-readable codes for first-party JSON routes. Clients branch on
 * `error`; the human sentence lives in `message` and stays free to change.
 */
export const API_ERROR = {
  rateLimited: "rate_limited",
  forbidden: "forbidden",
  internal: "internal_error",
  configUnavailable: "config_unavailable",
  notConfigured: "not_configured",
  upstream: "upstream_unavailable",
  invalidJson: "invalid_json",
  missingQuestion: "missing_question",
  questionTooLong: "question_too_long",
  aiUnavailable: "ai_unavailable",
  retrievalFailed: "retrieval_failed",
} as const;

export type ApiErrorCode = (typeof API_ERROR)[keyof typeof API_ERROR];

export interface ApiErrorBody {
  error: ApiErrorCode;
  message?: string;
  reason?: string;
}

export interface JsonErrorOptions {
  message?: string;
  /** Upstream-specific detail, e.g. the PSN failure kind. */
  reason?: string;
  headers?: HeadersInit;
}

export function jsonError(
  error: ApiErrorCode,
  status: number,
  { message, reason, headers }: JsonErrorOptions = {},
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error };
  if (message) {
    body.message = message;
  }
  if (reason) {
    body.reason = reason;
  }
  return NextResponse.json(body, { status, headers });
}
