import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { unstable_cache } from "next/cache";
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

/** Browser freshness only — colo is per visitor, so CDNs must not share this. */
const EDGE_MAX_AGE = 60;

const loadAnalytics = unstable_cache(
  async (token: string, zoneId: string) => fetchCloudflareAnalytics(token, zoneId),
  ["cloudflare-analytics"],
  { revalidate: WIDGET_MAX_AGE.cloudflare },
);

/**
 * Visitor colo from CF-Ray, plus yesterday's zone totals when a token is set.
 *
 * Always 200: local/dev and a GraphQL blip still leave the branded line up.
 * Unlike the other widget routes this stays `private` — caching it publicly
 * would stamp one visitor's colo onto everybody else.
 */
export const GET = widgetRoute(
  { route: "cloudflare", label: "Cloudflare" },
  async ({ isDraft }) => {
    const edge = edgeFromHeaders(await headers());

    let analytics = null;
    const token = env.CLOUDFLARE_API_TOKEN;
    const zoneId = env.CLOUDFLARE_ZONE_ID;
    if (token && zoneId && isCloudflareZoneId(zoneId)) {
      try {
        analytics = await loadAnalytics(token, zoneId);
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
