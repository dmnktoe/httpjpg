import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware to handle Storyblok preview mode
 * Checks for _storyblok query parameter and enables draft mode
 */
export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const storyblokParam = searchParams.get("_storyblok");

  // If Storyblok preview parameter is present, redirect to draft mode API
  if (storyblokParam) {
    const slug = request.nextUrl.pathname;
    const draftUrl = new URL("/api/draft", request.url);
    draftUrl.searchParams.set(
      "secret",
      process.env.STORYBLOK_PREVIEW_SECRET || "",
    );
    draftUrl.searchParams.set("slug", slug);

    return NextResponse.redirect(draftUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
