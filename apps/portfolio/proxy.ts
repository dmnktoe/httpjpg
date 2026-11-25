import { env } from "@httpjpg/env";
import { validateStoryblokPreviewToken } from "@httpjpg/storyblok-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isPublishedStory } from "@/lib/story-index";
import { storySlugForPath } from "@/lib/story-route";
import { isStoryblokEditorRequest } from "@/lib/storyblok-editor";

const NOT_FOUND_ROUTE = "/_not-found";
const DRAFT_MODE_COOKIE = "__prerender_bypass";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
};

export async function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const hasStoryblokToken = searchParams.has("_storyblok_tk[space_id]");
  const inEditor = isStoryblokEditorRequest(request);

  if (
    hasStoryblokToken &&
    !(await validateStoryblokPreviewToken(searchParams, env.STORYBLOK_PREVIEW_TOKEN))
  ) {
    return NextResponse.json({ error: "Invalid Storyblok token" }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  if (inEditor) {
    requestHeaders.set("x-storyblok-editor", "1");
  }

  const response = (await isUnknownStory(request, inEditor))
    ? NextResponse.rewrite(new URL(NOT_FOUND_ROUTE, request.url), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://app.storyblok.com",
  );
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }

  if (inEditor) {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

async function isUnknownStory(request: NextRequest, inEditor: boolean): Promise<boolean> {
  if (process.env.NODE_ENV === "development" || inEditor) {
    return false;
  }
  if (env.NEXT_PUBLIC_STORYBLOK_VERSION === "draft") {
    return false;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  if (request.cookies.has(DRAFT_MODE_COOKIE) || request.nextUrl.searchParams.has("_draft")) {
    return false;
  }
  const slug = storySlugForPath(request.nextUrl.pathname);
  if (!slug) {
    return false;
  }
  return (await isPublishedStory(slug)) === false;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
