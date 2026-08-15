import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { widgetCacheHeaders } from "@/lib/cache-headers";
import { fetchStravaStatus } from "@/lib/integrations/strava";
import { getConfig } from "@/lib/queries/config";

export async function GET() {
  const { isEnabled: isDraft } = await draftMode();
  try {
    if (!env.STRAVA_CLIENT_ID || !env.STRAVA_CLIENT_SECRET || !env.STRAVA_REFRESH_TOKEN) {
      return NextResponse.json(
        {
          error: "Strava not configured",
          message:
            "Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN to enable the widget",
        },
        { status: 501 },
      );
    }

    const config = await getConfig();
    if (!config?.strava_enabled) {
      return NextResponse.json(
        {
          error: "Strava disabled",
          message: "Enable strava_enabled in the Storyblok config story",
        },
        { status: 501 },
      );
    }

    const result = await fetchStravaStatus({
      clientId: env.STRAVA_CLIENT_ID,
      clientSecret: env.STRAVA_CLIENT_SECRET,
      refreshToken: env.STRAVA_REFRESH_TOKEN,
    });
    if (!result.ok) {
      console.warn(`Strava API error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Strava unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(result.status, {
      headers: widgetCacheHeaders(isDraft, 300),
    });
  } catch (error) {
    console.error("Strava API error:", error);
    captureServerException(error, { tags: { route: "strava" } });
    return NextResponse.json({ error: "Failed to fetch Strava status" }, { status: 500 });
  }
}
