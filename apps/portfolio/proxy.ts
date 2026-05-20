import { validateStoryblokPreviewToken } from "@httpjpg/storyblok-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const storyblokParam = searchParams.get("_storyblok");
  const hasStoryblokToken = searchParams.has("_storyblok_tk[space_id]");
  const inEditor = Boolean(storyblokParam || hasStoryblokToken);

  if (
    hasStoryblokToken &&
    !(await validateStoryblokPreviewToken(searchParams, process.env.STORYBLOK_PREVIEW_TOKEN))
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

  if (inEditor) {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
