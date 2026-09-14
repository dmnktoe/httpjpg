import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const draft = await draftMode();
    draft.disable();

    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const referrer = request.headers.get("referer");
    const url = new URL(redirectParam || referrer || "/", request.url);

    url.searchParams.delete("_draft");
    url.searchParams.delete("_storyblok");
    url.searchParams.delete("_storyblok_tk[space_id]");
    url.searchParams.delete("_storyblok_tk[timestamp]");
    url.searchParams.delete("_storyblok_tk[token]");

    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store, must-revalidate");

    return response;
  } catch (error) {
    captureServerException(error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
