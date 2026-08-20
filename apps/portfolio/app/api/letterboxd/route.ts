import { fetchLetterboxdFilms, isLetterboxdUsername } from "@/lib/integrations/letterboxd";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
import {
  resolveWidgetSetting,
  widgetConfigUnavailable,
  widgetNotConfigured,
  widgetPayload,
  widgetRoute,
  widgetUpstreamError,
} from "@/lib/widget-route";

export const GET = widgetRoute(
  { route: "letterboxd", label: "Letterboxd films" },
  async ({ isDraft }) => {
    const username = await resolveWidgetSetting({
      field: "letterboxd_username",
      validate: isLetterboxdUsername,
    });
    if (username.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (username.status === "missing") {
      return widgetNotConfigured("Letterboxd username", "letterboxd_username");
    }

    const result = await fetchLetterboxdFilms(username.value);
    if (!result.ok) {
      return widgetUpstreamError("Letterboxd", result);
    }

    return widgetPayload({ films: result.films }, { isDraft, maxAge: WIDGET_MAX_AGE.letterboxd });
  },
);
