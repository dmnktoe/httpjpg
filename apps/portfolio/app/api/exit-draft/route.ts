import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Disable draft mode
    const draft = await draftMode();
    draft.disable();

    // Get referrer or redirect parameter
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const referrer = request.headers.get("referer");
    const url = new URL(redirectParam || referrer || "/", request.url);

    // Remove draft/storyblok parameters
    url.searchParams.delete("_draft");
    url.searchParams.delete("_storyblok");
    url.searchParams.delete("_storyblok_tk[space_id]");
    url.searchParams.delete("_storyblok_tk[timestamp]");
    url.searchParams.delete("_storyblok_tk[token]");

    // Redirect to clean URL
    const response = NextResponse.redirect(url);

    // Clear cache
    response.headers.set("Cache-Control", "no-store, must-revalidate");

    return response;
  } catch (error) {
    captureServerException(error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
