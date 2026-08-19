import { env } from "@httpjpg/env";

import { jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchWeather } from "@/lib/integrations/weather";

export const GET = publicGet(
  "weather",
  async () => {
    const result = await fetchWeather(env.WEATHER_LATITUDE, env.WEATHER_LONGITUDE);
    if (!result.ok) {
      console.warn(`Weather fetch failed: ${result.status} - ${result.message}`);
      return jsonUpstream(result.message, result.status);
    }

    return jsonOk(
      {
        temperature: result.temperature,
        code: result.code,
        emoji: result.emoji,
        condition: result.condition,
        isDay: result.isDay,
      },
      { cache: { isDraft: false, maxAge: 900 } },
    );
  },
  { withDraft: false },
);
