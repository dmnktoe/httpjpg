import arcjet, { fixedWindow, shield } from "@arcjet/next";
import { env } from "@httpjpg/env";
import type { NextRequest, NextResponse } from "next/server";

import { API_ERROR, type ApiErrorBody, jsonError } from "./api-error";

// A single shared Arcjet client, created lazily and only when a key is present.
// Without ARCJET_KEY (local dev, tests, previews) rate limiting is a no-op, so
// the public routes keep working unprotected rather than erroring.
let client: ReturnType<typeof arcjet> | null = null;

function getClient() {
  if (!env.ARCJET_KEY) {
    return null;
  }
  if (!client) {
    client = arcjet({
      key: env.ARCJET_KEY,
      rules: [
        // Block common attacks (SQLi, path traversal, …) on these endpoints.
        shield({ mode: "LIVE" }),
        // One shared per-IP budget covers every limited route. A single page
        // load already fans out well past 60: the favicon proxy fires once per
        // external link, the footer widgets poll every 10–30s, and search runs
        // as the user types. 60/min throttled genuine visitors with 429s, so
        // lift it to a ceiling that still catches scripted abuse (hundreds+/min)
        // but clears real first-load bursts.
        fixedWindow({ mode: "LIVE", window: "60s", max: 200 }),
      ],
    });
  }
  return client;
}

/**
 * Returns a 429/403 response when Arcjet denies the request, or `null` to let
 * the handler proceed. Fails open: any limiter error allows the request through.
 */
export async function enforceRateLimit(
  request: NextRequest,
): Promise<NextResponse<ApiErrorBody> | null> {
  const aj = getClient();
  if (!aj) {
    return null;
  }

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      const isRateLimit = decision.reason.isRateLimit();
      return isRateLimit
        ? jsonError(API_ERROR.rateLimited, 429)
        : jsonError(API_ERROR.forbidden, 403);
    }
  } catch (error) {
    console.error("Arcjet rate-limit check failed; allowing request:", error);
  }

  return null;
}
