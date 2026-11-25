import { type NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest } from "@/lib/feed/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const denied = authorizeFeedRequest(request);
  if (denied) {
    return denied;
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
