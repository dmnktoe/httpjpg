import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { NextResponse } from "next/server";

import { fetchLetterboxdFilms, isLetterboxdUsername } from "@/lib/integrations/letterboxd";

async function resolveUsername(): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi().getStory({ slug: "config" });
    const config = story?.content as SbConfigStory | undefined;
    const username = config?.letterboxd_username;
    if (username && !isLetterboxdUsername(username)) {
      console.warn("Ignoring malformed letterboxd_username from Storyblok config");
      return undefined;
    }
    return username;
  } catch (error) {
    console.warn("Failed to fetch Letterboxd config from Storyblok:", error);
    return undefined;
  }
}

export async function GET() {
  try {
    const username = await resolveUsername();
    if (!username) {
      return NextResponse.json(
        {
          error: "Letterboxd username not configured",
          message: "Set letterboxd_username in Storyblok config",
        },
        { status: 500 },
      );
    }

    const result = await fetchLetterboxdFilms(username);
    if (!result.ok) {
      console.warn(`Letterboxd RSS error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Letterboxd unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { films: result.films },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Letterboxd API error:", error);
    captureServerException(error, { tags: { route: "letterboxd" } });
    return NextResponse.json({ error: "Failed to fetch Letterboxd films" }, { status: 500 });
  }
}
