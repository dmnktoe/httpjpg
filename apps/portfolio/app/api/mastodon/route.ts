import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import {
  fetchMastodonPosts,
  type MastodonHandle,
  parseMastodonHandle,
} from "@/lib/integrations/mastodon";

async function resolveHandle(): Promise<MastodonHandle | null> {
  try {
    const { isEnabled } = await draftMode();
    const story = await getStoryblokApi({ draftMode: isEnabled }).getStory({
      slug: "config",
    });
    const config = story?.content as SbConfigStory | undefined;
    const raw = config?.mastodon_handle;
    if (!raw) {
      return null;
    }
    const handle = parseMastodonHandle(raw);
    if (!handle) {
      console.warn("Ignoring malformed mastodon_handle from Storyblok config");
    }
    return handle;
  } catch (error) {
    console.warn("Failed to fetch Mastodon config from Storyblok:", error);
    return null;
  }
}

export async function GET() {
  try {
    const handle = await resolveHandle();
    if (!handle) {
      return NextResponse.json(
        {
          error: "Mastodon handle not configured",
          message: "Set mastodon_handle in Storyblok config, e.g. @user@mastodon.social",
        },
        { status: 501 },
      );
    }

    const result = await fetchMastodonPosts(handle);
    if (!result.ok) {
      console.warn(`Mastodon API error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Mastodon unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { posts: result.posts, handle: `@${handle.user}@${handle.host}` },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Mastodon API error:", error);
    captureServerException(error, { tags: { route: "mastodon" } });
    return NextResponse.json({ error: "Failed to fetch Mastodon posts" }, { status: 500 });
  }
}
