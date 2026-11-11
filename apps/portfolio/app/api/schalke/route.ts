import { fetchSchalkeStatus } from "@/lib/integrations/schalke";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
import { widgetPayload, widgetRoute, widgetUpstreamError } from "@/lib/widget-route";

export const GET = widgetRoute(
  { route: "schalke", label: "Schalke status" },
  async ({ isDraft }) => {
    const result = await fetchSchalkeStatus();
    if (!result.ok) {
      return widgetUpstreamError("OpenLigaDB", result);
    }

    const { fixture, standing, url } = result;
    return widgetPayload({ fixture, standing, url }, { isDraft, maxAge: WIDGET_MAX_AGE.schalke });
  },
);
