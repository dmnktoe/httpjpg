import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { NextResponse } from "next/server";

import { fetchPsnTrophies, isPsnUsername } from "@/lib/integrations/psn-trophies";

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
    const username = await resolveUsername();
    if (!username) {
      return NextResponse.json(
        {
          error: "PSN username not configured",
          message: "Set psn_username in Storyblok config",
        },
        { status: 500 },
      );
    }

    const result = await fetchPsnTrophies(username, undefined, env.PSN_FEED_PROXY || undefined);
    if (!result.ok) {
      console.warn(`PSN Trophy Leaders RSS error: ${result.status} - ${result.message}`);
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
