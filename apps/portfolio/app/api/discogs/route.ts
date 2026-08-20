import { fetchDiscogsCollection, isDiscogsUsername } from "@/lib/integrations/discogs";
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
  { route: "discogs", label: "Discogs collection" },
  async ({ isDraft }) => {
    const username = await resolveWidgetSetting({
      field: "discogs_username",
      validate: isDiscogsUsername,
    });
    if (username.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (username.status === "missing") {
      return widgetNotConfigured("Discogs username", "discogs_username");
    }

    const result = await fetchDiscogsCollection(username.value);
    if (!result.ok) {
      return widgetUpstreamError("Discogs", result);
    }

    return widgetPayload(
      { releases: result.releases },
      { isDraft, maxAge: WIDGET_MAX_AGE.discogs },
    );
  },
);
