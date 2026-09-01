import { fetchWithTimeout, readJson } from "./http";

const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
const ZONE_ID = /^[a-f0-9]{32}$/i;
const COLO = /^[A-Z]{3}$/;
const COUNTRY = /^[A-Z]{2}$/;

const ANALYTICS_QUERY = `query ZoneHttp($zoneTag: String!, $since: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequests1dGroups(
        limit: 2
        filter: { date_geq: $since }
        orderBy: [date_DESC]
      ) {
        dimensions {
          date
        }
        sum {
          requests
          cachedRequests
          threats
        }
      }
    }
  }
}`;

export interface CloudflareEdge {
  colo: string | null;
  country: string | null;
}

export interface CloudflareAnalytics {
  requests: number;
  cachedRequests: number;
  threats: number;
}

export interface CloudflareStatusPayload {
  colo: string | null;
  country: string | null;
  threats: number | null;
  cachedRatio: number | null;
}

export function isCloudflareZoneId(value: string): boolean {
  return ZONE_ID.test(value.trim());
}

/** CF-Ray looks like `230b030023ae2822-SJC` — the suffix is the IATA colo. */
export function coloFromCfRay(cfRay: string | null | undefined): string | null {
  if (!cfRay) {
    return null;
  }
  const colo = cfRay.trim().split("-").at(-1)?.toUpperCase();
  return colo && COLO.test(colo) ? colo : null;
}

export function parseCfCountry(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const code = value.trim().toUpperCase();
  if (code === "XX" || code === "T1") {
    return null;
  }
  return COUNTRY.test(code) ? code : null;
}

/** Visitor colo and country from the request Cloudflare already stamped. */
export function edgeFromHeaders(headers: { get(name: string): string | null }): CloudflareEdge {
  return {
    colo: coloFromCfRay(headers.get("cf-ray")),
    country: parseCfCountry(headers.get("cf-ipcountry")),
  };
}

export function cloudflareStatusPayload(
  edge: CloudflareEdge,
  analytics: CloudflareAnalytics | null,
): CloudflareStatusPayload {
  return {
    colo: edge.colo,
    country: edge.country,
    threats: analytics && analytics.threats > 0 ? analytics.threats : null,
    cachedRatio: analytics ? cachedRatio(analytics.requests, analytics.cachedRequests) : null,
  };
}

export function cachedRatio(requests: number, cachedRequests: number): number | null {
  if (requests <= 0) {
    return null;
  }
  return cachedRequests / requests;
}

interface GraphqlZone {
  httpRequests1dGroups?: Array<{
    dimensions?: { date?: string };
    sum?: {
      requests?: number;
      cachedRequests?: number;
      threats?: number;
    };
  }>;
}

interface GraphqlBody {
  data?: {
    viewer?: {
      zones?: GraphqlZone[];
    };
  };
  errors?: Array<{ message?: string }>;
}

function utcDateDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function firstDaySum(zones: GraphqlZone[] | undefined): CloudflareAnalytics | null {
  const groups = [...(zones?.[0]?.httpRequests1dGroups ?? [])].sort((a, b) =>
    (b.dimensions?.date ?? "").localeCompare(a.dimensions?.date ?? ""),
  );
  if (!groups.length) {
    return null;
  }
  for (const group of groups) {
    const requests = group.sum?.requests ?? 0;
    if (requests <= 0) {
      continue;
    }
    return {
      requests,
      cachedRequests: group.sum?.cachedRequests ?? 0,
      threats: group.sum?.threats ?? 0,
    };
  }
  return null;
}

/**
 * Yesterday's zone totals from the GraphQL Analytics API. Failures collapse
 * to null so the footer line can still show the visitor's colo.
 */
export async function fetchCloudflareAnalytics(
  token: string,
  zoneId: string,
): Promise<CloudflareAnalytics | null> {
  const result = await fetchWithTimeout(GRAPHQL_URL, {
    label: "Cloudflare Analytics",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ANALYTICS_QUERY,
      variables: { zoneTag: zoneId, since: utcDateDaysAgo(2) },
    }),
    hint: "Check CLOUDFLARE_API_TOKEN (Zone Analytics Read) and CLOUDFLARE_ZONE_ID.",
  });
  if (!result.ok) {
    console.warn(`Cloudflare Analytics: ${result.message}`);
    return null;
  }

  const parsed = await readJson<GraphqlBody>(result.response, "Cloudflare Analytics");
  if (!parsed.ok) {
    console.warn(`Cloudflare Analytics: ${parsed.message}`);
    return null;
  }
  if (parsed.data.errors?.length) {
    console.warn(`Cloudflare Analytics: ${parsed.data.errors[0]?.message ?? "GraphQL error"}`);
    return null;
  }

  return firstDaySum(parsed.data.data?.viewer?.zones);
}
