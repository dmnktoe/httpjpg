import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface StoryblokWebhookPayload {
  action: "published" | "unpublished" | "deleted";
  story?: {
    id: number;
    name: string;
    slug: string;
    full_slug: string;
    content_type?: string;
  };
}

/**
 * Webhook endpoint for Storyblok to trigger revalidation
 *
 * Setup in Storyblok:
 * Settings > Webhooks > Add Webhook
 * URL: https://yourdomain.com/api/revalidate
 * Secret: YOUR_REVALIDATE_SECRET
 * Trigger: Story published/unpublished/deleted
 *
 * Headers:
 * webhook-secret: YOUR_REVALIDATE_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret from header or query param
    const headerSecret = request.headers.get("webhook-secret");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const secret = headerSecret || querySecret;

    if (!secret || secret !== process.env.STORYBLOK_REVALIDATE_SECRET) {
      console.warn("Revalidation attempt with invalid secret");
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const body = (await request.json()) as StoryblokWebhookPayload;
    const { action, story } = body;

    if (!story?.full_slug) {
      console.warn("Webhook received without story slug", body);
      return NextResponse.json({ message: "No story slug provided" }, { status: 400 });
    }

    const storySlug = story.full_slug;
    const contentType = story.content_type;
    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Revalidate specific story cache tag (expire: 0 — webhook wants immediate refresh)
    revalidateTag(CACHE_TAGS.STORY(storySlug), { expire: 0 });
    revalidatedTags.push(CACHE_TAGS.STORY(storySlug));

    revalidateTag(CACHE_TAGS.STORIES, { expire: 0 });
    revalidatedTags.push(CACHE_TAGS.STORIES);

    // Revalidate the actual page path
    const pagePath = storySlug === STORYBLOK_SLUGS.HOME ? "/" : `/${storySlug}`;
    revalidatePath(pagePath);
    revalidatedPaths.push(pagePath);

    // Revalidate parent folder (e.g., /work if story is /work/project-1)
    const pathParts = storySlug.split("/");
    if (pathParts.length > 1) {
      const parentPath = `/${pathParts[0]}`;
      revalidatePath(parentPath);
      revalidatedPaths.push(parentPath);
    }

    // If config story changed, revalidate all pages (navigation updated)
    if (storySlug === STORYBLOK_SLUGS.CONFIG || contentType === STORYBLOK_SLUGS.CONFIG) {
      revalidateTag(CACHE_TAGS.CONFIG, { expire: 0 });
      revalidatePath("/", "layout");
      revalidatedTags.push(CACHE_TAGS.CONFIG);
      revalidatedPaths.push("/layout");
    }

    console.log(`[Storyblok Webhook] ${action} - ${storySlug}`);
    console.log(`Revalidated tags: ${revalidatedTags.join(", ")}`);
    console.log(`Revalidated paths: ${revalidatedPaths.join(", ")}`);

    return NextResponse.json({
      revalidated: true,
      action,
      story: storySlug,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      now: Date.now(),
    });
  } catch (error) {
    console.error("[Storyblok Webhook] Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
