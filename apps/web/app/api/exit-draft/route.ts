import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * API Route to disable Storyblok draft mode
 *
 * Usage: /api/exit-draft
 */
export async function GET(request: NextRequest) {
  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Redirect to home or provided redirect URL
  const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
