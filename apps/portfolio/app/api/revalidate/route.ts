import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface StoryblokWebhookPayload {
  action: "published" | "unpublished" | "deleted";
  full_slug?: string;
  story_id?: number;
  space_id?: number;
  text?: string;
  story?: {
    id: number;
    name: string;
    slug: string;
    full_slug: string;
    content_type?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const headerSecret = request.headers.get("webhook-secret");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const secret = headerSecret || querySecret;

    if (!secret || secret !== process.env.STORYBLOK_REVALIDATE_SECRET) {
      console.warn("Revalidation attempt with invalid secret");
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const body = (await request.json()) as StoryblokWebhookPayload;
    const { action } = body;

    const storySlug = body.story?.full_slug ?? body.full_slug;
    const contentType = body.story?.content_type;

    if (!storySlug) {
      console.warn("Webhook received without story slug", body);
      return NextResponse.json({ message: "No story slug provided" }, { status: 400 });
    }
    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    revalidateTag(CACHE_TAGS.STORY(storySlug), { expire: 0 });
    revalidatedTags.push(CACHE_TAGS.STORY(storySlug));

    revalidateTag(CACHE_TAGS.STORIES, { expire: 0 });
    revalidatedTags.push(CACHE_TAGS.STORIES);

    const pagePath = storySlug === STORYBLOK_SLUGS.HOME ? "/" : `/${storySlug}`;
    revalidatePath(pagePath);
    revalidatedPaths.push(pagePath);

    const pathParts = storySlug.split("/");
    if (pathParts.length > 1) {
      const parentPath = `/${pathParts[0]}`;
      revalidatePath(parentPath);
      revalidatedPaths.push(parentPath);
    }

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
