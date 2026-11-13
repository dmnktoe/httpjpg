import sharp from "sharp";

import { isHttpUrl, readLimited, safeFetch } from "./favicon";
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
  homeCrest: string | null;
  awayCrest: string | null;
  outcome: FixtureOutcome;
  competition: string;
  playedAt: string | null;
}

export interface SchalkeStanding {
  position: number;
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
  teamIconUrl?: string;
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

const LEAGUES = ["bl1", "bl2", "bl3"];
const CUP = "dfb";

const WEEKS_BACK = 8;

const CREST_SIZE = 16;
const CREST_TIMEOUT_MS = 5000;
const MAX_CREST_BYTES = 4 * 1024 * 1024;

function teamLabel(team: OpenLigaTeam | undefined): string {
  return team?.shortName || team?.teamName || "?";
}

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
    homeCrest: null,
    awayCrest: null,
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

export async function pixelateCrest(iconUrl: string | undefined): Promise<string | null> {
  const target = iconUrl ? isHttpUrl(iconUrl) : null;
  if (!target) {
    return null;
  }

  try {
    const response = await safeFetch(target, "image/*", Date.now() + CREST_TIMEOUT_MS);
    if (!response?.ok) {
      return null;
    }
    const source = await readLimited(response, MAX_CREST_BYTES);
    if (!source) {
      return null;
    }
    const pixels = await sharp(source)
      .resize(CREST_SIZE, CREST_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    return `data:image/png;base64,${pixels.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fetchFixture(match: OpenLigaMatch): Promise<SchalkeFixture | null> {
  const fixture = parseFixture(match);
  if (!fixture) {
    return null;
  }
  const [homeCrest, awayCrest] = await Promise.all([
    pixelateCrest(match.team1?.teamIconUrl),
    pixelateCrest(match.team2?.teamIconUrl),
  ]);
  return { ...fixture, homeCrest, awayCrest };
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
  const played = results.ok && Array.isArray(results.data) ? results.data : [];
  return readStanding(table.data, played, league);
}

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

  const [fixture, standing] = await Promise.all([
    recent[0] ? fetchFixture(recent[0]) : null,
    lastLeagueMatch ? fetchStanding(lastLeagueMatch) : null,
  ]);

  return { ok: true, fixture, standing, url: CLUB_URL };
}
