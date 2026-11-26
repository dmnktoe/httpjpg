import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "@/lib/api-error";
import {
  authorizeFeedRequest,
  FEED_EDITOR_COOKIE,
  FEED_SESSION_COOKIE,
  FEED_SESSION_MAX_AGE,
  feedPublishToken,
  feedSessionValue,
  isFeedPublishToken,
} from "@/lib/feed/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const denied = authorizeFeedRequest(request);
  if (denied) {
    return denied;
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const expected = feedPublishToken();
  if (!expected) {
    return jsonError(API_ERROR.notConfigured, 503, {
      message: "Publishing is not configured on this deployment",
    });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(API_ERROR.invalidJson, 400);
  }
  const token = (body as { token?: unknown } | null)?.token;
  if (typeof token !== "string" || !isFeedPublishToken(token)) {
    return jsonError(API_ERROR.unauthorized, 401);
  }

  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  const cookie = {
    path: "/",
    maxAge: FEED_SESSION_MAX_AGE,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  } as const;
  response.cookies.set({
    ...cookie,
    name: FEED_SESSION_COOKIE,
    value: feedSessionValue(expected),
    httpOnly: true,
  });
  response.cookies.set({ ...cookie, name: FEED_EDITOR_COOKIE, value: "1" });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.delete(FEED_SESSION_COOKIE);
  response.cookies.delete(FEED_EDITOR_COOKIE);
  return response;
}
