import { aj, ajApi, ajWebhook } from "@httpjpg/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Apply Arcjet protection to API routes and webhooks
 *
 * This helper should be used in API route handlers instead of middleware
 * to keep the middleware bundle size under 1MB limit.
 *
 * @example
 * ```ts
 * // In your API route
 * export async function GET(request: NextRequest) {
 *   const protection = await applyArcjetProtection(request, "api");
 *   if (protection) return protection;
 *
 *   // Your API logic here
 * }
 * ```
 */
export async function applyArcjetProtection(
  request: NextRequest,
  type: "default" | "api" | "webhook" = "default",
): Promise<NextResponse | null> {
  // Select appropriate Arcjet instance
  let arcjetInstance = aj;

  if (type === "api") {
    arcjetInstance = ajApi;
  } else if (type === "webhook") {
    arcjetInstance = ajWebhook;
  }

  const decision = await arcjetInstance.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (decision.reason.isBot()) {
      return NextResponse.json({ error: "Bot Detected" }, { status: 403 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // Protection passed
}
