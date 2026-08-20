import { getWidgetStatus, WIDGET_STATUS_MAX_AGE } from "@/lib/queries/widget-status";
import { widgetPayload, widgetRoute } from "@/lib/widget-route";

/**
 * Every slow-moving footer widget in one response, so the footer opens one
 * connection instead of four. Widgets that are off or unreachable come back
 * null rather than failing the envelope — the dedicated routes stay the place
 * to ask why.
 */
export const GET = widgetRoute({ route: "status", label: "widget status" }, async ({ isDraft }) => {
  const status = await getWidgetStatus();
  return widgetPayload(status, { isDraft, maxAge: WIDGET_STATUS_MAX_AGE });
});
