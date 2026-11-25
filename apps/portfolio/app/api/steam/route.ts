import { env } from "@httpjpg/env";

import { fetchSteamStatus, isSteamId } from "@/lib/integrations/steam";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
import {
  resolveWidgetSetting,
  widgetConfigUnavailable,
  widgetMissingEnv,
  widgetNotConfigured,
  widgetPayload,
  widgetRoute,
  widgetUpstreamError,
} from "@/lib/widget-route";

export const GET = widgetRoute({ route: "steam", label: "Steam games" }, async ({ isDraft }) => {
  const apiKey = env.STEAM_API_KEY;
  if (!apiKey) {
    return widgetMissingEnv("Steam", "STEAM_API_KEY");
  }

  const steamId = await resolveWidgetSetting({ field: "steam_id", validate: isSteamId });
  if (steamId.status === "unavailable") {
    return widgetConfigUnavailable();
  }
  if (steamId.status === "missing") {
    return widgetNotConfigured("SteamID64", "steam_id");
  }

  const result = await fetchSteamStatus(steamId.value, apiKey);
  if (!result.ok) {
    return widgetUpstreamError("Steam", result);
  }

  return widgetPayload(result.status, { isDraft, maxAge: WIDGET_MAX_AGE.steam });
});
