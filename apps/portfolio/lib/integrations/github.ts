import { fetchWithTimeout, readJson } from "./http";
import { PIXEL_GRID, pixelateImage } from "./pixelate";

export type GithubActivityKind = "push" | "pull_request" | "release" | "create" | "star";

export interface GithubActivity {
  kind: GithubActivityKind;
  verb: string;
  repo: string;
  detail: string | null;
  url: string;
  createdAt: string | null;
}

export interface GithubProfile {
  login: string;
  avatar: string | null;
  url: string;
}

export interface GithubStatus {
  profile: GithubProfile;
  activity: GithubActivity[];
}

export type GithubFetchResult =
  | { ok: true; status: GithubStatus }
  | { ok: false; status: number; message: string };

interface GithubEvent {
  type?: string;
  actor?: { login?: string; avatar_url?: string };
  repo?: { name?: string };
  created_at?: string;
  payload?: {
    action?: string;
    ref?: string | null;
    ref_type?: string;
    head?: string;
    pull_request?: { number?: number; html_url?: string; merged?: boolean };
    number?: number;
    release?: { tag_name?: string; html_url?: string };
  };
}

const DEFAULT_LIMIT = 4;
const API_URL = "https://api.github.com";
const USER_AGENT = "httpjpg.com/1.0 (+https://www.httpjpg.com)";

const GITHUB_USERNAME = /^[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38}$/;

export function isGithubUsername(value: unknown): value is string {
  return typeof value === "string" && GITHUB_USERNAME.test(value);
}

function repoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

function branchName(ref: string | null | undefined): string | null {
  return ref ? ref.replace(/^refs\/heads\//, "") : null;
}

export function toActivity(event: GithubEvent): GithubActivity | null {
  const repo = event.repo?.name;
  if (!repo) {
    return null;
  }
  const payload = event.payload ?? {};
  const createdAt = event.created_at ?? null;

  switch (event.type) {
    case "PushEvent": {
      const branch = branchName(payload.ref);
      return {
        kind: "push",
        verb: "pushed to",
        repo,
        detail: branch,
        url: payload.head
          ? `${repoUrl(repo)}/commit/${payload.head}`
          : branch
            ? `${repoUrl(repo)}/tree/${branch}`
            : repoUrl(repo),
        createdAt,
      };
    }
    case "PullRequestEvent": {
      const number = payload.pull_request?.number ?? payload.number;
      const merged = payload.action === "closed" && payload.pull_request?.merged === true;
      if (!number || (payload.action !== "opened" && !merged)) {
        return null;
      }
      return {
        kind: "pull_request",
        verb: merged ? "merged" : "opened",
        repo,
        detail: `#${number}`,
        url: payload.pull_request?.html_url ?? `${repoUrl(repo)}/pull/${number}`,
        createdAt,
      };
    }
    case "ReleaseEvent": {
      const tag = payload.release?.tag_name;
      if (payload.action !== "published" || !tag) {
        return null;
      }
      return {
        kind: "release",
        verb: "released",
        repo,
        detail: tag,
        url: payload.release?.html_url ?? `${repoUrl(repo)}/releases/tag/${tag}`,
        createdAt,
      };
    }
    case "CreateEvent":
      return payload.ref_type === "repository"
        ? { kind: "create", verb: "created", repo, detail: null, url: repoUrl(repo), createdAt }
        : null;
    case "WatchEvent":
      return { kind: "star", verb: "starred", repo, detail: null, url: repoUrl(repo), createdAt };
    default:
      return null;
  }
}

export function parseEvents(
  events: GithubEvent[],
  username: string,
  limit = DEFAULT_LIMIT,
): GithubStatus {
  const actor = events.find((event) => event.actor?.login)?.actor;
  const login = actor?.login ?? username;
  const activity =
    limit > 0
      ? events
          .map(toActivity)
          .filter((entry): entry is GithubActivity => entry !== null)
          .slice(0, limit)
      : [];
  return {
    profile: {
      login,
      avatar: actor?.avatar_url ?? `https://github.com/${username}.png`,
      url: `https://github.com/${login}`,
    },
    activity,
  };
}

export async function fetchGithubActivity(
  username: string,
  token?: string,
  limit = DEFAULT_LIMIT,
): Promise<GithubFetchResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": USER_AGENT,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const result = await fetchWithTimeout(
    `${API_URL}/users/${encodeURIComponent(username)}/events/public?per_page=30`,
    { label: "GitHub", hint: "Check the GitHub username (and GITHUB_API_TOKEN if set).", headers },
  );
  if (!result.ok) {
    return result;
  }

  const body = await readJson<GithubEvent[]>(result.response, "GitHub");
  if (!body.ok) {
    return body;
  }

  const status = parseEvents(Array.isArray(body.data) ? body.data : [], username, limit);
  const avatar = await pixelateImage(status.profile.avatar, {
    width: PIXEL_GRID.thumb,
    height: PIXEL_GRID.thumb,
  });
  return { ok: true, status: { ...status, profile: { ...status.profile, avatar } } };
}
