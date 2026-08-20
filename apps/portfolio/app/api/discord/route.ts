import { fetchDiscordPresence, isDiscordUserId } from "@/lib/integrations/discord";
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
  { route: "discord", label: "Discord status" },
  async ({ isDraft }) => {
    const userId = await resolveWidgetSetting({
      field: "discord_user_id",
      validate: isDiscordUserId,
    });
    if (userId.status === "unavailable") {
      return widgetConfigUnavailable();
    }
    if (userId.status === "missing") {
      return widgetNotConfigured("Discord User ID", "discord_user_id");
    }

    const result = await fetchDiscordPresence(userId.value);
    if (!result.ok) {
      return widgetUpstreamError("Lanyard API", result);
    }

    return widgetPayload(result.presence, { isDraft, maxAge: WIDGET_MAX_AGE.discord });
  },
);
