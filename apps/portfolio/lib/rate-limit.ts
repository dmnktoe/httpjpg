import arcjet, { fixedWindow, shield } from "@arcjet/next";
import { env } from "@httpjpg/env";
import { type NextRequest, NextResponse } from "next/server";

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
        // Generous per-IP budget: the widgets poll every 10–30s, so 60/min is
        // comfortably above legitimate use while stopping scripted abuse.
        fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
      ],
    });
  }
  return client;
}

/**
 * Returns a 429/403 response when Arcjet denies the request, or `null` to let
 * the handler proceed. Fails open: any limiter error allows the request through.
 */
export async function enforceRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const aj = getClient();
  if (!aj) {
    return null;
  }

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      const isRateLimit = decision.reason.isRateLimit();
      return NextResponse.json(
        { error: isRateLimit ? "rate_limited" : "forbidden" },
        { status: isRateLimit ? 429 : 403 },
      );
    }
  } catch (error) {
    console.error("Arcjet rate-limit check failed; allowing request:", error);
  }

  return null;
}
