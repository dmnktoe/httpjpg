// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchGithubActivity, isGithubUsername, parseEvents, toActivity } from "./github";

vi.mock("./pixelate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pixelate")>()),
  pixelateImage: vi.fn(async (source: string | null | undefined) => source ?? null),
  pixelateEach: vi.fn(async (items: unknown[]) => items),
}));

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const ACTOR = { login: "dmnktoe", avatar_url: "https://avatars.githubusercontent.test/u/1" };
const REPO = { name: "dmnktoe/httpjpg" };
const CREATED = "2026-11-24T12:00:00Z";

const PUSH = {
  type: "PushEvent",
  actor: ACTOR,
  repo: REPO,
  created_at: CREATED,
  payload: { ref: "refs/heads/main", head: "abc123" },
};

describe("toActivity", () => {
  it("maps a push to its head commit", () => {
    expect(toActivity(PUSH)).toEqual({
      kind: "push",
      verb: "pushed to",
      repo: "dmnktoe/httpjpg",
      detail: "main",
      url: "https://github.com/dmnktoe/httpjpg/commit/abc123",
      createdAt: CREATED,
    });
  });

  it("links a push without a head to its branch", () => {
    expect(toActivity({ ...PUSH, payload: { ref: "refs/heads/dev" } })?.url).toBe(
      "https://github.com/dmnktoe/httpjpg/tree/dev",
    );
  });

  it("maps opened and merged pull requests, skipping other actions", () => {
    const pr = (action: string, merged?: boolean) => ({
      type: "PullRequestEvent",
      repo: REPO,
      payload: { action, number: 42, pull_request: { number: 42, merged } },
    });

    expect(toActivity(pr("opened"))).toMatchObject({
      verb: "opened",
      detail: "#42",
      url: "https://github.com/dmnktoe/httpjpg/pull/42",
    });
    expect(toActivity(pr("closed", true))?.verb).toBe("merged");
    expect(toActivity(pr("closed", false))).toBeNull();
    expect(toActivity(pr("synchronize"))).toBeNull();
  });

  it("maps published releases", () => {
    const release = {
      type: "ReleaseEvent",
      repo: REPO,
      payload: { action: "published", release: { tag_name: "v2.16.0" } },
    };

    expect(toActivity(release)).toMatchObject({
      verb: "released",
      detail: "v2.16.0",
      url: "https://github.com/dmnktoe/httpjpg/releases/tag/v2.16.0",
    });
  });

  it("keeps new repositories and stars, drops branch creation and unknown types", () => {
    const create = (refType: string) => ({
      type: "CreateEvent",
      repo: REPO,
      payload: { ref_type: refType },
    });

    expect(toActivity(create("repository"))?.verb).toBe("created");
    expect(toActivity(create("branch"))).toBeNull();
    expect(toActivity({ type: "WatchEvent", repo: REPO })?.verb).toBe("starred");
    expect(toActivity({ type: "IssueCommentEvent", repo: REPO })).toBeNull();
    expect(toActivity({ type: "PushEvent" })).toBeNull();
  });
});

describe("parseEvents", () => {
  it("reads the profile from the actor and keeps the newest activity", () => {
    const status = parseEvents(
      [{ type: "IssueCommentEvent", repo: REPO, actor: ACTOR }, PUSH, PUSH],
      "dmnktoe",
      1,
    );

    expect(status.profile).toEqual({
      login: "dmnktoe",
      avatar: ACTOR.avatar_url,
      url: "https://github.com/dmnktoe",
    });
    expect(status.activity).toHaveLength(1);
  });

  it("falls back to the configured username when there are no events", () => {
    expect(parseEvents([], "dmnktoe")).toEqual({
      profile: {
        login: "dmnktoe",
        avatar: "https://github.com/dmnktoe.png",
        url: "https://github.com/dmnktoe",
      },
      activity: [],
    });
  });
});

describe("fetchGithubActivity", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("reads public events, sending the token only when there is one", async () => {
    mockFetch.mockResolvedValue(jsonResponse([PUSH]));

    await fetchGithubActivity("dmnktoe");
    await fetchGithubActivity("dmnktoe", "token");

    const [url, anonymous] = mockFetch.mock.calls[0] as [string, RequestInit];
    const authed = mockFetch.mock.calls[1][1] as RequestInit;
    expect(url).toBe("https://api.github.com/users/dmnktoe/events/public?per_page=30");
    expect(anonymous.headers).not.toHaveProperty("Authorization");
    expect(authed.headers).toMatchObject({ Authorization: "Bearer token" });
  });

  it("returns the parsed activity", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([PUSH]));

    const result = await fetchGithubActivity("dmnktoe");

    expect(result).toMatchObject({ ok: true, status: { activity: [{ kind: "push" }] } });
  });

  it("treats a non-array body as no events and surfaces errors", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: "odd" }));
    expect(await fetchGithubActivity("dmnktoe")).toMatchObject({
      ok: true,
      status: { activity: [] },
    });

    mockFetch.mockResolvedValueOnce(jsonResponse({}, false, 404));
    expect(await fetchGithubActivity("ghost")).toMatchObject({ ok: false, status: 404 });
  });
});

describe("isGithubUsername", () => {
  it("accepts GitHub's username rules", () => {
    expect(isGithubUsername("dmnktoe")).toBe(true);
    expect(isGithubUsername("a-b-c")).toBe(true);
    expect(isGithubUsername("-lead")).toBe(false);
    expect(isGithubUsername("trail-")).toBe(false);
    expect(isGithubUsername("dou--ble")).toBe(false);
    expect(isGithubUsername("../admin")).toBe(false);
    expect(isGithubUsername("a".repeat(40))).toBe(false);
    expect(isGithubUsername(undefined)).toBe(false);
  });
});
