import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { NextResponse } from "next/server";

import { fetchLatestTrophy, isPsnUsername } from "@/lib/integrations/psn-trophies";

async function resolveUsername(): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi().getStory({ slug: "config" });
    const config = story?.content as SbConfigStory | undefined;
    const username = config?.psn_username;
    if (username && !isPsnUsername(username)) {
      console.warn("Ignoring malformed psn_username from Storyblok config");
      return undefined;
    }
    return username;
  } catch (error) {
    console.warn("Failed to fetch PSN config from Storyblok:", error);
    return undefined;
  }
}

export async function GET() {
  try {
    if (!env.PSN_NPSSO) {
      return NextResponse.json(
        {
          error: "PSN not configured",
          message: "Set PSN_NPSSO to enable the trophy widget",
        },
        { status: 500 },
      );
    }

    const username = await resolveUsername();

    const result = await fetchLatestTrophy(env.PSN_NPSSO, username);
    if (!result.ok) {
      console.warn(`PSN trophy fetch failed: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "PSN trophies unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { trophies: result.trophies },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("PSN trophies API error:", error);
    captureServerException(error, { tags: { route: "psn-trophies" } });
    return NextResponse.json({ error: "Failed to fetch PSN trophies" }, { status: 500 });
  }
}
