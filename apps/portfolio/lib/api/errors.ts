import { NextResponse } from "next/server";

/** Stable machine codes returned by first-party JSON routes. */
export const API_ERROR = {
  rateLimited: "rate_limited",
  forbidden: "forbidden",
  unauthorized: "unauthorized",
  internal: "internal_error",
  configUnavailable: "config_unavailable",
  notConfigured: "not_configured",
  upstream: "upstream_unavailable",
  invalidJson: "invalid_json",
  invalidRequest: "invalid_request",
  missingQuestion: "missing_question",
  questionTooLong: "question_too_long",
  aiUnavailable: "ai_unavailable",
  retrievalFailed: "retrieval_failed",
} as const;

export type ApiErrorCode = (typeof API_ERROR)[keyof typeof API_ERROR];

export interface ApiErrorBody {
  error: string;
  message?: string;
  reason?: string;
}

export interface JsonErrorOptions {
  message?: string;
  reason?: string;
  headers?: HeadersInit;
}

export function jsonError(
  error: string,
  status: number,
  options: JsonErrorOptions = {},
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error };
  if (options.message) {
    body.message = options.message;
  }
  if (options.reason) {
    body.reason = options.reason;
  }
  return NextResponse.json(body, { status, headers: options.headers });
}

export function jsonUpstream(
  message: string,
  status: number,
  options: Omit<JsonErrorOptions, "message"> = {},
): NextResponse<ApiErrorBody> {
  return jsonError(API_ERROR.upstream, status, { ...options, message });
}
