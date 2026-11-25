import { createHash, timingSafeEqual } from "node:crypto";

import { env } from "@httpjpg/env";
import type { NextRequest, NextResponse } from "next/server";

import { API_ERROR, type ApiErrorBody, jsonError } from "../api-error";

const MIN_TOKEN_LENGTH = 32;

export function feedPublishToken(): string | null {
  const token = env.FEED_PUBLISH_TOKEN?.trim();
  return token && token.length >= MIN_TOKEN_LENGTH ? token : null;
}

export function authorizeFeedRequest(request: NextRequest): NextResponse<ApiErrorBody> | null {
  const expected = feedPublishToken();
  if (!expected) {
    return jsonError(API_ERROR.notConfigured, 503, {
      message: "Publishing is not configured on this deployment",
    });
  }
  const presented = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!presented || !isSameSecret(presented.trim(), expected)) {
    return jsonError(API_ERROR.unauthorized, 401, { headers: { "WWW-Authenticate": "Bearer" } });
  }
  return null;
}

function isSameSecret(presented: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(presented), digest(expected));
}
