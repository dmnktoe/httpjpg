import { env } from "@httpjpg/env";

import { fetchLastfmScrobbles, isLastfmUsername } from "@/lib/integrations/lastfm";
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

export const GET = widgetRoute(
  { route: "lastfm", label: "Last.fm scrobbles" },
  async ({ isDraft }) => {
    const apiKey = env.LASTFM_API_KEY;
    if (!apiKey) {
      return widgetMissingEnv("Last.fm", "LASTFM_API_KEY");
    }

    const username = await resolveWidgetSetting({
      field: "lastfm_username",
      validate: isLastfmUsername,
    });
    if (username.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (username.status === "missing") {
      return widgetNotConfigured("Last.fm username", "lastfm_username");
    }

    const result = await fetchLastfmScrobbles(username.value, apiKey);
    if (!result.ok) {
      return widgetUpstreamError("Last.fm", result);
    }

    return widgetPayload(
      { tracks: result.tracks, total: result.total },
      { isDraft, maxAge: WIDGET_MAX_AGE.lastfm },
    );
  },
);
