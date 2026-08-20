import { env } from "@httpjpg/env";

import { fetchXTimeline, isXUsername } from "@/lib/integrations/x-posts";
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

export const GET = widgetRoute({ route: "x", label: "X posts" }, async ({ isDraft }) => {
  const apiKey = env.TWEETAPI_KEY;
  if (!apiKey) {
    return widgetMissingEnv("X", "TWEETAPI_KEY");
  }

  const username = await resolveWidgetSetting({ field: "x_username", validate: isXUsername });
  if (username.status === "unavailable") {
    return widgetConfigUnavailable();
  }
  if (username.status === "missing") {
    return widgetNotConfigured("X username", "x_username");
  }

  const result = await fetchXTimeline({
    apiUrl: env.TWEETAPI_API_URL,
    apiKey,
    username: username.value,
  });
  if (!result.ok) {
    return widgetUpstreamError("X", result);
  }

  return widgetPayload(result.timeline, { isDraft, maxAge: WIDGET_MAX_AGE.x });
});
