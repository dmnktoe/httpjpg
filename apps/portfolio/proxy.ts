import { env } from "@httpjpg/env";
import { validateStoryblokPreviewToken } from "@httpjpg/storyblok-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
};

export async function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const storyblokParam = searchParams.get("_storyblok");
  const hasStoryblokToken = searchParams.has("_storyblok_tk[space_id]");
  const inEditor = Boolean(storyblokParam || hasStoryblokToken);

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

  const response = NextResponse.next({ request: { headers: requestHeaders } });
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
