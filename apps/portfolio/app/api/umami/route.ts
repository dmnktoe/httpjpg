import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { fetchUmamiStats, statsWindow } from "@/lib/integrations/umami";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  const websiteId = env.NEXT_PUBLIC_UMAMI_ID;
  const apiKey = env.UMAMI_API_KEY;
  if (!websiteId || !apiKey) {
    return NextResponse.json(
      {
        error: "Umami not configured",
        message: "Set NEXT_PUBLIC_UMAMI_ID and UMAMI_API_KEY",
      },
      { status: 501 },
    );
  }

  try {
    const { startAt, endAt } = statsWindow(env.UMAMI_STATS_SINCE, Date.now());
    const result = await fetchUmamiStats({
      apiUrl: env.UMAMI_API_URL,
      apiKey,
      websiteId,
      startAt,
      endAt,
    });

    if (!result.ok) {
      console.warn(`Umami stats error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Umami unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { ...result.stats, since: new Date(startAt).toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } },
    );
  } catch (error) {
    console.error("Umami API error:", error);
    captureServerException(error, { tags: { route: "umami" } });
    return NextResponse.json({ error: "Failed to fetch Umami stats" }, { status: 500 });
  }
}
