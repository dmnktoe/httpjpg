import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * API Route to enable Storyblok draft mode (Visual Editor)
 *
 * Usage: /api/draft?secret=YOUR_SECRET&slug=work/project-1
 *
 * Setup in Storyblok Visual Editor:
 * Settings > Visual Editor > Default Environment:
 * https://yourdomain.com/api/draft?secret=YOUR_SECRET&slug=
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Validate required parameters
  if (!secret) {
    return NextResponse.json(
      { message: "Missing secret parameter" },
      { status: 400 },
    );
  }

  // Check secret to confirm this is a valid request
  if (secret !== process.env.STORYBLOK_PREVIEW_SECRET) {
    console.warn("Draft mode attempt with invalid secret");
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Determine redirect path FIRST
  let redirectPath = "/";

  // Handle slug parameter
  if (slug) {
    // Storyblok sometimes sends literal "{SLUG}" string - redirect to home
    if (slug === "{SLUG}" || slug === "") {
      redirectPath = "/";
    } else if (slug === "home") {
      // "home" story should redirect to root
      redirectPath = "/";
    } else {
      // Regular slug - ensure it starts with /
      redirectPath = slug.startsWith("/") ? slug : `/${slug}`;
    }
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Create absolute URL for redirect with _draft param
  const origin = request.nextUrl.origin;
  const redirectUrl = new URL(redirectPath, origin);

  // Add _draft parameter so the page knows to use draft mode
  redirectUrl.searchParams.set("_draft", "1");

  console.log(`[Draft Mode] Enabled for slug="${slug}" → ${redirectPath}`);

  // Redirect to the path with _draft parameter
  const response = NextResponse.redirect(redirectUrl);

  // Set cache headers to ensure no caching of draft content
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");

  return response;
}
