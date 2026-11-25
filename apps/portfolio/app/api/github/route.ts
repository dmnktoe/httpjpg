import { env } from "@httpjpg/env";

import { fetchGithubActivity, isGithubUsername } from "@/lib/integrations/github";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
import {
  resolveWidgetSetting,
  widgetConfigUnavailable,
  widgetNotConfigured,
  widgetPayload,
  widgetRoute,
  widgetUpstreamError,
} from "@/lib/widget-route";

// No key check: public events load without GITHUB_API_TOKEN, only at a lower rate.
export const GET = widgetRoute(
  { route: "github", label: "GitHub activity" },
  async ({ isDraft }) => {
    const username = await resolveWidgetSetting({
      field: "github_username",
      validate: isGithubUsername,
    });
    if (username.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (username.status === "missing") {
      return widgetNotConfigured("GitHub username", "github_username");
    }

    const result = await fetchGithubActivity(username.value, env.GITHUB_API_TOKEN);
    if (!result.ok) {
      return widgetUpstreamError("GitHub", result);
    }

    return widgetPayload(result.status, { isDraft, maxAge: WIDGET_MAX_AGE.github });
  },
);
