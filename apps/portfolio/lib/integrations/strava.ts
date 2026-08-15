import { fetchWithTimeout, readJson } from "./http";

export interface StravaCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface StravaActivitySummary {
  id: number;
  name: string;
  type: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  startDate: string;
  url: string;
}

export interface StravaStatusPayload {
  /** Sum of today's activity distances in meters. */
  todayDistanceMeters: number;
  /** Sum of today's moving time in seconds. */
  todayMovingTimeSeconds: number;
  /** Today's activity count. */
  todayCount: number;
  /** Dominant sport type today, or the latest activity's type when today is empty. */
  primaryType: string | null;
  /** Profile URL for the authenticated athlete. */
  profileUrl: string;
  /** Latest activity overall — fallback when nothing happened today. */
  latest: StravaActivitySummary | null;
}

export type StravaFetchResult =
  | { ok: true; status: StravaStatusPayload }
  | { ok: false; status: number; message: string };

interface StravaTokenResponse {
  access_token?: string;
  athlete?: { id?: number };
}

interface StravaAthleteResponse {
  id?: number;
}

interface StravaActivityResponse {
  id?: number;
  name?: string;
  type?: string;
  sport_type?: string;
  distance?: number;
  moving_time?: number;
  start_date?: string;
}

const TOKEN_URL = "https://www.strava.com/oauth/token";
const API_BASE = "https://www.strava.com/api/v3";

/** Start of the local calendar day as a Unix timestamp (seconds). */
export function startOfLocalDayUnix(now = new Date()): number {
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(local.getTime() / 1000);
}

export function formatDistanceKm(meters: number): string {
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Rough step estimate from walking/running distance. Strava's public API does
 * not expose step counts, so this is only used as a display hint for Walk/Run/
 * Hike — never for rides or other sports.
 */
export function estimateSteps(meters: number): number {
  // ~1 312 steps per km at a typical walking cadence.
  return Math.round((meters / 1000) * 1312);
}

export function isSteppableType(type: string | null | undefined): boolean {
  if (!type) {
    return false;
  }
  return /^(run|walk|hike|trailrun)$/i.test(type.replace(/\s+/g, ""));
}

export function summarizeActivities(
  activities: StravaActivityResponse[],
  profileUrl: string,
  afterUnix: number,
): StravaStatusPayload {
  const mapped = activities
    .map(toSummary)
    .filter((activity): activity is StravaActivitySummary => activity !== null);

  const today = mapped.filter((activity) => {
    const started = Date.parse(activity.startDate);
    return Number.isFinite(started) && started / 1000 >= afterUnix;
  });

  let todayDistanceMeters = 0;
  let todayMovingTimeSeconds = 0;
  const typeDistance = new Map<string, number>();

  for (const activity of today) {
    todayDistanceMeters += activity.distanceMeters;
    todayMovingTimeSeconds += activity.movingTimeSeconds;
    typeDistance.set(
      activity.type,
      (typeDistance.get(activity.type) ?? 0) + activity.distanceMeters,
    );
  }

  let primaryType: string | null = null;
  let best = -1;
  for (const [type, distance] of typeDistance) {
    if (distance > best) {
      best = distance;
      primaryType = type;
    }
  }

  const latest = mapped[0] ?? null;
  if (!primaryType && latest) {
    primaryType = latest.type;
  }

  return {
    todayDistanceMeters,
    todayMovingTimeSeconds,
    todayCount: today.length,
    primaryType,
    profileUrl,
    latest,
  };
}

function toSummary(activity: StravaActivityResponse): StravaActivitySummary | null {
  if (typeof activity.id !== "number" || !activity.start_date) {
    return null;
  }
  const type = activity.sport_type || activity.type || "Workout";
  return {
    id: activity.id,
    name: activity.name?.trim() || type,
    type,
    distanceMeters: typeof activity.distance === "number" ? activity.distance : 0,
    movingTimeSeconds: typeof activity.moving_time === "number" ? activity.moving_time : 0,
    startDate: activity.start_date,
    url: `https://www.strava.com/activities/${activity.id}`,
  };
}

async function refreshAccessToken(
  credentials: StravaCredentials,
): Promise<
  | { ok: true; accessToken: string; athleteId?: number }
  | { ok: false; status: number; message: string }
> {
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: credentials.refreshToken,
    grant_type: "refresh_token",
  });

  const result = await fetchWithTimeout(TOKEN_URL, {
    label: "Strava",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    hint: "Check STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN.",
  });
  if (!result.ok) {
    return result;
  }

  const json = await readJson<StravaTokenResponse>(result.response, "Strava token");
  if (!json.ok) {
    return json;
  }
  if (!json.data.access_token) {
    return { ok: false, status: 502, message: "Strava token response missing access_token." };
  }

  return {
    ok: true,
    accessToken: json.data.access_token,
    athleteId: json.data.athlete?.id,
  };
}

export async function fetchStravaStatus(
  credentials: StravaCredentials,
): Promise<StravaFetchResult> {
  const token = await refreshAccessToken(credentials);
  if (!token.ok) {
    return token;
  }

  let athleteId = token.athleteId;
  if (!athleteId) {
    const athleteResult = await fetchWithTimeout(`${API_BASE}/athlete`, {
      label: "Strava",
      headers: { Authorization: `Bearer ${token.accessToken}` },
      hint: "Check the Strava access token scopes (read).",
    });
    if (!athleteResult.ok) {
      return athleteResult;
    }
    const athleteJson = await readJson<StravaAthleteResponse>(
      athleteResult.response,
      "Strava athlete",
    );
    if (!athleteJson.ok) {
      return athleteJson;
    }
    athleteId = athleteJson.data.id;
  }

  const after = startOfLocalDayUnix();
  // Pull a short recent window so "latest" still works on rest days.
  const activitiesResult = await fetchWithTimeout(
    `${API_BASE}/athlete/activities?after=${after - 60 * 60 * 24 * 14}&per_page=30`,
    {
      label: "Strava",
      headers: { Authorization: `Bearer ${token.accessToken}` },
      hint: "Check activity:read_permission on the Strava token.",
    },
  );
  if (!activitiesResult.ok) {
    return activitiesResult;
  }

  const activitiesJson = await readJson<StravaActivityResponse[]>(
    activitiesResult.response,
    "Strava activities",
  );
  if (!activitiesJson.ok) {
    return activitiesJson;
  }

  const profileUrl = athleteId
    ? `https://www.strava.com/athletes/${athleteId}`
    : "https://www.strava.com";

  return {
    ok: true,
    status: summarizeActivities(activitiesJson.data, profileUrl, after),
  };
}
