import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { fetchDiscogsCollection, isDiscogsUsername } from "@/lib/integrations/discogs";

async function resolveUsername(): Promise<string | undefined> {
  try {
    const { isEnabled } = await draftMode();
    const story = await getStoryblokApi({ draftMode: isEnabled }).getStory({
      slug: "config",
    });
    const config = story?.content as SbConfigStory | undefined;
    const username = config?.discogs_username;
    if (username && !isDiscogsUsername(username)) {
      console.warn("Ignoring malformed discogs_username from Storyblok config");
      return undefined;
    }
    return username;
  } catch (error) {
    console.warn("Failed to fetch Discogs config from Storyblok:", error);
    return undefined;
  }
}

export async function GET() {
  try {
    const username = await resolveUsername();
    if (!username) {
      return NextResponse.json(
        {
          error: "Discogs username not configured",
          message: "Set discogs_username in Storyblok config",
        },
        { status: 501 },
      );
    }

    const result = await fetchDiscogsCollection(username);
    if (!result.ok) {
      console.warn(`Discogs API error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Discogs unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { releases: result.releases },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
    );
  } catch (error) {
    console.error("Discogs API error:", error);
    captureServerException(error, { tags: { route: "discogs" } });
    return NextResponse.json({ error: "Failed to fetch Discogs collection" }, { status: 500 });
  }
}
