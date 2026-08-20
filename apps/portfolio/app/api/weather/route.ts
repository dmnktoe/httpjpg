import { env } from "@httpjpg/env";

import { fetchWeather } from "@/lib/integrations/weather";
import { widgetPayload, widgetRoute, widgetUpstreamError } from "@/lib/widget-route";

export const GET = widgetRoute({ route: "weather", label: "weather" }, async ({ isDraft }) => {
  const result = await fetchWeather(env.WEATHER_LATITUDE, env.WEATHER_LONGITUDE);
  if (!result.ok) {
    return widgetUpstreamError("Weather", result);
  }

  return widgetPayload(
    {
      temperature: result.temperature,
      code: result.code,
      emoji: result.emoji,
      condition: result.condition,
      isDay: result.isDay,
    },
    { isDraft, maxAge: 900 },
  );
});
