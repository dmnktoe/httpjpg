import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import {
  cloudflareStatusPayload,
  edgeFromHeaders,
  fetchCloudflareAnalytics,
  isCloudflareZoneId,
} from "@/lib/integrations/cloudflare";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
import { widgetRoute } from "@/lib/widget-route";

/** Browser-only: the colo is per visitor. */
const EDGE_MAX_AGE = 60;

/** Visitor colo plus yesterday's zone totals. Always 200, always `private`. */
export const GET = widgetRoute(
  { route: "cloudflare", label: "Cloudflare" },
  async ({ isDraft }) => {
    const edge = edgeFromHeaders(await headers());

    let analytics = null;
    const token = env.CLOUDFLARE_API_TOKEN;
    const zoneId = env.CLOUDFLARE_ZONE_ID;
    if (token && zoneId && isCloudflareZoneId(zoneId)) {
      try {
        analytics = await readAnalytics(token, zoneId);
      } catch (error) {
        console.warn("Cloudflare Analytics failed:", error);
        captureServerException(error, { tags: { route: "cloudflare" } });
      }
    }

    return NextResponse.json(cloudflareStatusPayload(edge, analytics), {
      headers: {
        "Cache-Control": isDraft ? "private, no-store" : `private, max-age=${EDGE_MAX_AGE}`,
      },
    });
  },
);

async function readAnalytics(token: string, zoneId: string) {
  "use cache";
  cacheLife({ revalidate: WIDGET_MAX_AGE.cloudflare });
  return fetchCloudflareAnalytics(token, zoneId);
}
