import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { aj } from "./arcjet";

/**
 * Arcjet middleware for Next.js
 * Protects all routes with shield, bot detection, and rate limiting
 */
export async function withArcjet(request: NextRequest) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (decision.reason.isBot()) {
      return NextResponse.json({ error: "Bot Detected" }, { status: 403 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}
