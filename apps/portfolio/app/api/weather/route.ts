import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextResponse } from "next/server";

import { fetchWeather } from "@/lib/integrations/weather";

export async function GET() {
  try {
    const result = await fetchWeather(env.WEATHER_LATITUDE, env.WEATHER_LONGITUDE);
    if (!result.ok) {
      console.warn(`Weather fetch failed: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "Weather unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { temperature: result.temperature, code: result.code, emoji: result.emoji },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
    );
  } catch (error) {
    console.error("Weather API error:", error);
    captureServerException(error, { tags: { route: "weather" } });
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
