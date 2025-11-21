import { CACHE_TAGS } from "@httpjpg/storyblok-api";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Webhook endpoint for Storyblok to trigger revalidation
 *
 * Setup in Storyblok:
 * Settings > Webhooks > Add Webhook
 * URL: https://yourdomain.com/api/revalidate
 * Secret: YOUR_REVALIDATE_SECRET
 * Trigger: Story published/unpublished
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify secret
    const secret = request.headers.get("webhook-secret");
    if (secret !== process.env.STORYBLOK_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // Get story slug from webhook payload
    const storySlug = body?.story?.full_slug;

    if (storySlug) {
      // Revalidate specific story
      revalidateTag(CACHE_TAGS.STORY(storySlug));
      console.log(`Revalidated: ${storySlug}`);
    }

    // Always revalidate stories list
    revalidateTag(CACHE_TAGS.STORIES);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 },
    );
  }
}
