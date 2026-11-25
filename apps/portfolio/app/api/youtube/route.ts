import { env } from "@httpjpg/env";

import { fetchYoutubeStatus, isYoutubeChannelId } from "@/lib/integrations/youtube";
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
  { route: "youtube", label: "YouTube uploads" },
  async ({ isDraft }) => {
    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return widgetMissingEnv("YouTube", "YOUTUBE_API_KEY");
    }

    const channelId = await resolveWidgetSetting({
      field: "youtube_channel_id",
      validate: isYoutubeChannelId,
    });
    if (channelId.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (channelId.status === "missing") {
      return widgetNotConfigured("YouTube channel id", "youtube_channel_id");
    }

    const result = await fetchYoutubeStatus(channelId.value, apiKey);
    if (!result.ok) {
      return widgetUpstreamError("YouTube", result);
    }

    return widgetPayload(result.status, { isDraft, maxAge: WIDGET_MAX_AGE.youtube });
  },
);
