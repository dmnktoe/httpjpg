import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Debug API Route to check Storyblok stories
 * Usage: GET /api/debug/stories?slug=music
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug") || "";

  try {
    const api = getStoryblokApi({ draftMode: true });

    // Try to fetch the specific story
    let story = null;
    let error = null;

    try {
      story = await api.getStory({ slug });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    // Also get all stories to show what exists
    const allStories = await api.getAllSlugs({});

    return NextResponse.json({
      requested: slug,
      found: !!story,
      story: story
        ? {
            name: story.name,
            full_slug: story.full_slug,
            slug: story.slug,
            is_folder: story.is_startpage,
            published: story.published_at,
          }
        : null,
      error,
      available_stories: allStories.map((s) => ({
        slug: s.slug,
        id: s.id,
        is_folder: s.isFolder,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
