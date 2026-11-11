import { fetchWithTimeout, type HttpFailure, readJson } from "./http";

const OUTCOME = { win: "win", draw: "draw", loss: "loss" } as const;
export type FixtureOutcome = (typeof OUTCOME)[keyof typeof OUTCOME];

const TREND = { up: "up", down: "down", same: "same" } as const;
export type StandingTrend = (typeof TREND)[keyof typeof TREND];

export interface SchalkeFixture {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  /** Seen from Schalke's side, whichever end they played at. */
  outcome: FixtureOutcome;
  /** OpenLigaDB league shortcut: `bl1`, `bl2`, `bl3` or `dfb`. */
  competition: string;
  playedAt: string | null;
}

export interface SchalkeStanding {
  position: number;
  /** Where the club stood before its latest league matchday; null on matchday one. */
  previousPosition: number | null;
  trend: StandingTrend;
  points: number;
  teams: number;
  league: string;
}

export interface SchalkeStatus {
  fixture: SchalkeFixture | null;
  standing: SchalkeStanding | null;
  url: string;
}

export type SchalkeFetchResult = ({ ok: true } & SchalkeStatus) | HttpFailure;

interface OpenLigaTeam {
  teamId?: number;
  teamName?: string;
  shortName?: string;
}

interface OpenLigaResult {
  pointsTeam1?: number;
  pointsTeam2?: number;
  resultOrderID?: number;
}

export interface OpenLigaMatch {
  leagueShortcut?: string;
  leagueSeason?: number;
  matchDateTimeUTC?: string;
  matchIsFinished?: boolean;
  group?: { groupOrderID?: number };
  team1?: OpenLigaTeam;
  team2?: OpenLigaTeam;
  matchResults?: OpenLigaResult[];
}

export interface OpenLigaTableRow {
  teamInfoId?: number;
  points?: number;
  goals?: number;
  opponentGoals?: number;
  matches?: number;
}

const API = "https://api.openligadb.de";
const TEAM_ID = 9;
const CLUB_URL = "https://schalke04.de";

/**
 * OpenLigaDB files the women's and youth sides under the same team id, so the
 * men's fixtures have to be picked out by competition.
 */
const LEAGUES = ["bl1", "bl2", "bl3"];
const CUP = "dfb";

/** Far enough back to still find a match across the winter break. */
const WEEKS_BACK = 8;

function teamLabel(team: OpenLigaTeam | undefined): string {
  return team?.shortName || team?.teamName || "?";
}

/** The last entry is the one that stands: full time, or extra time and penalties in the cup. */
function finalScore(match: OpenLigaMatch): [number, number] | null {
  const results = [...(match.matchResults ?? [])].sort(
    (a, b) => (b.resultOrderID ?? 0) - (a.resultOrderID ?? 0),
  );
  const final = results[0];
  if (typeof final?.pointsTeam1 !== "number" || typeof final?.pointsTeam2 !== "number") {
    return null;
  }
  return [final.pointsTeam1, final.pointsTeam2];
}

/** Finished men's matches, newest first. */
export function recentMatches(matches: OpenLigaMatch[]): OpenLigaMatch[] {
  return matches
    .filter(
      (match) =>
        match.matchIsFinished === true &&
        typeof match.leagueShortcut === "string" &&
        (LEAGUES.includes(match.leagueShortcut) || match.leagueShortcut === CUP) &&
        finalScore(match) !== null,
    )
    .sort((a, b) => (b.matchDateTimeUTC ?? "").localeCompare(a.matchDateTimeUTC ?? ""));
}

export function parseFixture(match: OpenLigaMatch): SchalkeFixture | null {
  const score = finalScore(match);
  if (!score) {
    return null;
  }
  const [homeGoals, awayGoals] = score;
  const isHome = match.team1?.teamId === TEAM_ID;
  const own = isHome ? homeGoals : awayGoals;
  const other = isHome ? awayGoals : homeGoals;

  return {
    home: teamLabel(match.team1),
    away: teamLabel(match.team2),
    homeGoals,
    awayGoals,
    outcome: own > other ? OUTCOME.win : own < other ? OUTCOME.loss : OUTCOME.draw,
    competition: match.leagueShortcut ?? "",
    playedAt: match.matchDateTimeUTC ?? null,
  };
}

interface TableLine {
  team: number;
  points: number;
  goals: number;
  against: number;
  matches: number;
}

function toLine(row: OpenLigaTableRow): TableLine {
  return {
    team: row.teamInfoId ?? -1,
    points: row.points ?? 0,
    goals: row.goals ?? 0,
    against: row.opponentGoals ?? 0,
    matches: row.matches ?? 0,
  };
}

/**
 * The feed only carries the current table, so the previous position is worked
 * out by taking the latest matchday's results back off it and re-sorting.
 */
export function readStanding(
  table: OpenLigaTableRow[],
  matchday: OpenLigaMatch[],
  league: string,
): SchalkeStanding | null {
  const lines = table.map(toLine);
  const index = lines.findIndex((line) => line.team === TEAM_ID);
  if (index === -1) {
    return null;
  }

  const before = new Map(lines.map((line) => [line.team, { ...line }]));
  for (const match of matchday) {
    const score = match.matchIsFinished === true ? finalScore(match) : null;
    const home = before.get(match.team1?.teamId ?? -1);
    const away = before.get(match.team2?.teamId ?? -1);
    if (!score || !home || !away) {
      continue;
    }
    const [homeGoals, awayGoals] = score;
    home.matches -= 1;
    away.matches -= 1;
    home.goals -= homeGoals;
    home.against -= awayGoals;
    away.goals -= awayGoals;
    away.against -= homeGoals;
    if (homeGoals === awayGoals) {
      home.points -= 1;
      away.points -= 1;
    } else if (homeGoals > awayGoals) {
      home.points -= 3;
    } else {
      away.points -= 3;
    }
  }

  // Bundesliga order: points, goal difference, goals scored. The sort is
  // stable, so teams still level keep the feed's own order.
  const previous = [...before.values()].sort(
    (a, b) =>
      b.points - a.points || b.goals - b.against - (a.goals - a.against) || b.goals - a.goals,
  );
  const own = before.get(TEAM_ID);
  const position = index + 1;
  const previousPosition =
    own && own.matches > 0 ? previous.findIndex((line) => line.team === TEAM_ID) + 1 : null;

  let trend: StandingTrend = TREND.same;
  if (previousPosition !== null && previousPosition !== position) {
    trend = position < previousPosition ? TREND.up : TREND.down;
  }

  return {
    position,
    previousPosition,
    trend,
    points: lines[index].points,
    teams: lines.length,
    league,
  };
}

async function fetchOpenLiga<T>(path: string): Promise<{ ok: true; data: T } | HttpFailure> {
  const result = await fetchWithTimeout(`${API}${path}`, { label: "OpenLigaDB" });
  if (!result.ok) {
    return result;
  }
  return readJson<T>(result.response, "OpenLigaDB");
}

async function fetchStanding(match: OpenLigaMatch): Promise<SchalkeStanding | null> {
  const league = match.leagueShortcut;
  const season = match.leagueSeason;
  const matchday = match.group?.groupOrderID;
  if (!league || typeof season !== "number" || typeof matchday !== "number") {
    return null;
  }

  const [table, results] = await Promise.all([
    fetchOpenLiga<OpenLigaTableRow[]>(`/getbltable/${league}/${season}`),
    fetchOpenLiga<OpenLigaMatch[]>(`/getmatchdata/${league}/${season}/${matchday}`),
  ]);
  if (!table.ok || !Array.isArray(table.data)) {
    return null;
  }
  // Without the matchday the position still stands; only the trend is lost.
  const played = results.ok && Array.isArray(results.data) ? results.data : [];
  return readStanding(table.data, played, league);
}

/** Schalke's last result and league position, from the keyless OpenLigaDB feed. */
export async function fetchSchalkeStatus(): Promise<SchalkeFetchResult> {
  const matches = await fetchOpenLiga<OpenLigaMatch[]>(
    `/getmatchesbyteamid/${TEAM_ID}/${WEEKS_BACK}/0`,
  );
  if (!matches.ok) {
    return matches;
  }
  if (!Array.isArray(matches.data)) {
    return { ok: false, status: 502, message: "Malformed OpenLigaDB response." };
  }

  const recent = recentMatches(matches.data);
  const lastLeagueMatch = recent.find((match) => LEAGUES.includes(match.leagueShortcut ?? ""));

  return {
    ok: true,
    fixture: recent[0] ? parseFixture(recent[0]) : null,
    standing: lastLeagueMatch ? await fetchStanding(lastLeagueMatch) : null,
    url: CLUB_URL,
  };
}
