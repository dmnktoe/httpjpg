import { fetchWithTimeout, readJson } from "./http";

export interface UmamiStats {
  pageviews: number;
  visitors: number;
  visits: number;
}

export type UmamiFetchResult =
  | { ok: true; stats: UmamiStats }
  | { ok: false; status: number; message: string };

interface UmamiMetric {
  value?: number;
}

interface UmamiStatsResponse {
  pageviews?: UmamiMetric;
  visitors?: UmamiMetric;
  visits?: UmamiMetric;
}

const FALLBACK_SINCE = "2024-01-01";

export function statsWindow(since: string, now: number): { startAt: number; endAt: number } {
  const parsed = Date.parse(since);
  const startAt = Number.isNaN(parsed) ? Date.parse(FALLBACK_SINCE) : parsed;
  return { startAt: Math.min(startAt, now), endAt: now };
}

function toCount(metric: UmamiMetric | undefined): number | null {
  const value = metric?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export interface UmamiStatsRequest {
  apiUrl: string;
  apiKey: string;
  websiteId: string;
  startAt: number;
  endAt: number;
}

export async function fetchUmamiStats({
  apiUrl,
  apiKey,
  websiteId,
  startAt,
  endAt,
}: UmamiStatsRequest): Promise<UmamiFetchResult> {
  const base = apiUrl.replace(/\/+$/, "");
  const url = `${base}/websites/${encodeURIComponent(websiteId)}/stats?startAt=${startAt}&endAt=${endAt}`;

  const result = await fetchWithTimeout(url, {
    label: "Umami",
    hint: "Check UMAMI_API_KEY and NEXT_PUBLIC_UMAMI_ID.",
    headers: { "x-umami-api-key": apiKey, Accept: "application/json" },
  });
  if (!result.ok) {
    return result;
  }

  const body = await readJson<UmamiStatsResponse>(result.response, "Umami");
  if (!body.ok) {
    return body;
  }

  const pageviews = toCount(body.data?.pageviews);
  const visitors = toCount(body.data?.visitors);
  if (pageviews === null || visitors === null) {
    return { ok: false, status: 502, message: "Malformed Umami response." };
  }

  return {
    ok: true,
    stats: { pageviews, visitors, visits: toCount(body.data?.visits) ?? 0 },
  };
}
