import { aj, ajApi, ajWebhook } from "@httpjpg/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * SHA1 hash implementation for Edge Runtime
 * Edge Runtime doesn't support Node.js crypto module
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate Storyblok Visual Editor token
 * Token format: SHA1(space_id:preview_token:timestamp)
 */
async function validateStoryblokToken(request: NextRequest): Promise<boolean> {
  const searchParams = request.nextUrl.searchParams;
  const spaceId = searchParams.get("_storyblok_tk[space_id]");
  const timestamp = searchParams.get("_storyblok_tk[timestamp]");
  const token = searchParams.get("_storyblok_tk[token]");

  if (!spaceId || !timestamp || !token) {
    return false;
  }

  // Validate timestamp (token valid for 1 hour)
  const now = Math.floor(Date.now() / 1000);
  const tokenTimestamp = Number.parseInt(timestamp, 10);

  if (now - tokenTimestamp > 3600) {
    console.warn("[Middleware] Storyblok token expired");
    return false;
  }

  // Validate token hash
  const previewToken = process.env.STORYBLOK_PREVIEW_TOKEN;
  if (!previewToken) {
    console.warn("[Middleware] STORYBLOK_PREVIEW_TOKEN not configured");
    return false;
  }

  const validationString = `${spaceId}:${previewToken}:${timestamp}`;
  const validationToken = await sha1(validationString);

  const isValid = token === validationToken;

  if (!isValid) {
    console.warn("[Middleware] Invalid Storyblok token");
  }

  return isValid;
}

/**
 * Middleware to handle Arcjet security and Storyblok Visual Editor integration
 *
 * Features:
 * - Arcjet protection (shield, bot detection, rate limiting)
 * - Validates Storyblok Visual Editor tokens
 * - Adds security headers for iframe embedding
 * - Disables caching for Visual Editor requests
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const storyblokParam = searchParams.get("_storyblok");
  const hasStoryblokToken = searchParams.has("_storyblok_tk[space_id]");

  // Apply Arcjet protection
  let arcjetInstance = aj; // Default protection

  // Stricter protection for API routes
  if (pathname.startsWith("/api/")) {
    arcjetInstance = ajApi;
  }

  // Very strict protection for webhooks
  if (pathname.includes("/webhook") || pathname.includes("/revalidate")) {
    arcjetInstance = ajWebhook;
  }

  const decision = await arcjetInstance.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (decision.reason.isBot()) {
      return NextResponse.json({ error: "Bot Detected" }, { status: 403 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.next();

  // Security headers for Storyblok Visual Editor iframe
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://app.storyblok.com",
  );

  // Handle Visual Editor requests
  if (storyblokParam || hasStoryblokToken) {
    // Validate token if present
    if (hasStoryblokToken && !(await validateStoryblokToken(request))) {
      return NextResponse.json(
        { error: "Invalid Storyblok token" },
        { status: 401 },
      );
    }

    // Disable caching for Visual Editor
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");

    console.log("[Middleware] Storyblok Visual Editor request validated");
  }

  return response;
}

/**
 * Middleware Configuration
 * Only run middleware on specific routes for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
