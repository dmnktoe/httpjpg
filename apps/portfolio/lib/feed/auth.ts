import { createHash, timingSafeEqual } from "node:crypto";

import { env } from "@httpjpg/env";
import type { NextRequest, NextResponse } from "next/server";

import { API_ERROR, type ApiErrorBody, jsonError } from "../api-error";

export const FEED_SESSION_COOKIE = "httpjpg_feed_session";
export const FEED_EDITOR_COOKIE = "httpjpg_feed_editor";
export const FEED_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const MIN_TOKEN_LENGTH = 32;
const SAFE_METHODS = new Set(["GET", "HEAD"]);

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
  if (presented) {
    return isSameSecret(presented.trim(), expected) ? null : unauthorized();
  }
  const session = request.cookies?.get(FEED_SESSION_COOKIE)?.value;
  if (session && isSameSecret(session, feedSessionValue(expected)) && isOwnRequest(request)) {
    return null;
  }
  return unauthorized();
}

export function isFeedPublishToken(presented: string): boolean {
  const expected = feedPublishToken();
  return Boolean(expected) && isSameSecret(presented.trim(), expected as string);
}

export function feedSessionValue(token: string): string {
  return createHash("sha256").update(`feed-session:${token}`).digest("hex");
}

function isOwnRequest(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) {
    return true;
  }
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  const host = request.headers.get("host");
  return origin === siteOrigin() || (Boolean(host) && hostOf(origin) === host);
}

function siteOrigin(): string | null {
  try {
    return new URL(env.NEXT_PUBLIC_APP_URL).origin;
  } catch {
    return null;
  }
}

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function unauthorized(): NextResponse<ApiErrorBody> {
  return jsonError(API_ERROR.unauthorized, 401, { headers: { "WWW-Authenticate": "Bearer" } });
}

function isSameSecret(presented: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(presented), digest(expected));
}
