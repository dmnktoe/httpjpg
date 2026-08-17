import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "./errors";

export interface JsonOkOptions {
  status?: number;
  headers?: HeadersInit;
  cache?: {
    isDraft: boolean;
    maxAge: number;
  };
}

export function cacheHeaders(isDraft: boolean, maxAge: number): Record<string, string> {
  return {
    "Cache-Control": isDraft
      ? "private, no-store"
      : `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}

export function jsonOk<T>(data: T, options: JsonOkOptions = {}): NextResponse<T> {
  const headers = new Headers(options.headers);
  if (options.cache) {
    const cache = cacheHeaders(options.cache.isDraft, options.cache.maxAge);
    for (const [key, value] of Object.entries(cache)) {
      headers.set(key, value);
    }
  }
  return NextResponse.json(data, { status: options.status ?? 200, headers });
}

export async function parseJsonBody(
  request: NextRequest,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: jsonError(API_ERROR.invalidJson, 400) };
  }
}
