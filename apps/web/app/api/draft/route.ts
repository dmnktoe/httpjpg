import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * API Route to enable Storyblok draft mode
 *
 * Usage: /api/draft?secret=YOUR_SECRET&slug=portfolio/project-1
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "/";

  // Check secret to confirm this is a valid request
  if (secret !== process.env.STORYBLOK_PREVIEW_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path from Storyblok
  const redirectUrl = new URL(`/${slug}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
