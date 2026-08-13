// @vitest-environment node

import { beforeEach, vi } from "vitest";

const { envObj } = vi.hoisted(() => ({
  envObj: {
    GROQ_API_KEY: "groq-key",
    GROQ_MODEL: "test-model",
    NEXT_PUBLIC_SENTRY_DSN: "https://sentry.example/1",
    NEXT_PUBLIC_APP_VERSION: "v1.2.3",
    NEXT_PUBLIC_COMMIT_SHA: "abc1234",
    NEXT_PUBLIC_BUILD_TIME: "2026-01-01T00:00:00Z",
    PSN_NPSSO: "npsso-token",
  } as Record<string, string | undefined>,
}));

vi.mock("@httpjpg/env", () => ({ env: envObj }));
vi.mock("@httpjpg/storyblok-api", () => ({ getStoryblokApi: vi.fn() }));
vi.mock("./config", () => ({ getConfig: vi.fn() }));
vi.mock("./activity", async () => {
  const actual = await vi.importActual<typeof import("./activity")>("./activity");
  return { ...actual, getActivitySources: vi.fn() };
});

import { getStoryblokApi } from "@httpjpg/storyblok-api";

import { getActivitySources } from "./activity";
import { getConfig } from "./config";
import { getBuildInfo, getSiteStatus, type ServiceStatus } from "./status";

const mockGetStoryblokApi = vi.mocked(getStoryblokApi);
const mockGetConfig = vi.mocked(getConfig);
const mockGetActivitySources = vi.mocked(getActivitySources);

function mockStoryblok(result: unknown, shouldReject = false) {
  const getStories = shouldReject
    ? vi.fn().mockRejectedValue(result)
    : vi.fn().mockResolvedValue(result);
  mockGetStoryblokApi.mockReturnValue({ getStories } as never);
  return getStories;
}

function sources(overrides: Record<string, unknown> = {}) {
  return { work: [], films: [], records: [], trophies: [], issues: [], ...overrides } as never;
}

function find(services: ServiceStatus[], id: string): ServiceStatus | undefined {
  return services.find((entry) => entry.id === id);
}

beforeEach(() => {
  vi.clearAllMocks();
  envObj.GROQ_API_KEY = "groq-key";
  envObj.NEXT_PUBLIC_SENTRY_DSN = "https://sentry.example/1";
  envObj.PSN_NPSSO = "npsso-token";
  mockStoryblok({ stories: [{ uuid: "1" }], total: 12 });
  mockGetConfig.mockResolvedValue({} as never);
  mockGetActivitySources.mockResolvedValue(sources());
});

describe("getSiteStatus · Storyblok probe", () => {
  it("reports ok with the published count when the CDN answers", async () => {
    const { services } = await getSiteStatus();

    expect(find(services, "storyblok")).toMatchObject({
      state: "ok",
      probed: true,
      detail: expect.stringContaining("12 published"),
    });
  });

  it("reports down when the space answers with nothing", async () => {
    mockStoryblok({ stories: [], total: 0 });

    const { services } = await getSiteStatus();

    expect(find(services, "storyblok")).toMatchObject({
      state: "down",
      detail: "no published stories",
    });
  });

  it("reports the error message when the CDN throws", async () => {
    mockStoryblok(new Error("storyblok down"), true);

    const { services } = await getSiteStatus();

    expect(find(services, "storyblok")).toMatchObject({ state: "down", detail: "storyblok down" });
  });

  it("survives a config failure rather than taking the page down with it", async () => {
    mockGetConfig.mockRejectedValue(new Error("config gone"));

    await expect(getSiteStatus()).resolves.toMatchObject({ services: expect.any(Array) });
  });
});

describe("getSiteStatus · feeds", () => {
  it("marks an unconfigured feed off and does not claim to have probed it", async () => {
    const { services } = await getSiteStatus();

    expect(find(services, "letterboxd")).toMatchObject({
      state: "off",
      detail: "not configured",
      probed: false,
    });
  });

  it("counts the entries a configured feed returned", async () => {
    mockGetConfig.mockResolvedValue({ letterboxd_username: "someone" } as never);
    mockGetActivitySources.mockResolvedValue(
      sources({ films: [{ id: "a" }, { id: "b" }] }) as never,
    );

    const { services } = await getSiteStatus();

    expect(find(services, "letterboxd")).toMatchObject({
      state: "ok",
      detail: "2 recent",
      probed: true,
    });
  });

  it("reports a configured feed that failed as down, with its own message", async () => {
    mockGetConfig.mockResolvedValue({ letterboxd_username: "someone" } as never);
    mockGetActivitySources.mockResolvedValue(
      sources({ issues: [{ source: "letterboxd", message: "429 from letterboxd" }] }) as never,
    );

    const { services } = await getSiteStatus();

    expect(find(services, "letterboxd")).toMatchObject({
      state: "down",
      detail: "429 from letterboxd",
      probed: true,
    });
  });

  it("keeps one source's failure off another source's row", async () => {
    mockGetConfig.mockResolvedValue({
      letterboxd_username: "someone",
      discogs_enabled: true,
      discogs_username: "collector",
    } as never);
    mockGetActivitySources.mockResolvedValue(
      sources({ issues: [{ source: "discogs", message: "discogs timed out" }] }) as never,
    );

    const { services } = await getSiteStatus();

    expect(find(services, "discogs")).toMatchObject({ state: "down" });
    expect(find(services, "letterboxd")).toMatchObject({ state: "ok" });
  });
});

describe("getSiteStatus · configured-only services", () => {
  it("never claims to have probed Ask, Spotify, Discord or Sentry", async () => {
    const { services } = await getSiteStatus();

    for (const id of ["ask", "spotify", "discord", "sentry"]) {
      expect(find(services, id)?.probed).toBe(false);
    }
  });

  it("reads Ask from the key rather than calling the model", async () => {
    const withKey = await getSiteStatus();
    expect(find(withKey.services, "ask")).toMatchObject({
      state: "ok",
      detail: expect.stringContaining("test-model"),
    });

    envObj.GROQ_API_KEY = undefined;
    const withoutKey = await getSiteStatus();
    expect(find(withoutKey.services, "ask")).toMatchObject({
      state: "off",
      detail: expect.stringContaining("search still works"),
    });
  });

  it("treats Spotify and Discord as on unless the config turns them off", async () => {
    const byDefault = await getSiteStatus();
    expect(find(byDefault.services, "spotify")?.state).toBe("ok");
    expect(find(byDefault.services, "discord")?.state).toBe("ok");

    mockGetConfig.mockResolvedValue({ spotify_enabled: false, discord_enabled: false } as never);
    const disabled = await getSiteStatus();
    expect(find(disabled.services, "spotify")?.state).toBe("off");
    expect(find(disabled.services, "discord")?.state).toBe("off");
  });

  it("reports Sentry off when no DSN is set", async () => {
    envObj.NEXT_PUBLIC_SENTRY_DSN = undefined;

    const { services } = await getSiteStatus();

    expect(find(services, "sentry")).toMatchObject({
      state: "off",
      detail: expect.stringContaining("not reported"),
    });
  });

  it("stamps the moment the check ran", async () => {
    const { checkedAt } = await getSiteStatus();

    expect(Number.isNaN(Date.parse(checkedAt))).toBe(false);
  });
});

describe("getBuildInfo", () => {
  it("reads the build stamps off the env", () => {
    expect(getBuildInfo("https://github.com/example/repo")).toEqual({
      version: "v1.2.3",
      commitSha: "abc1234",
      buildTime: "2026-01-01T00:00:00Z",
      repositoryUrl: "https://github.com/example/repo",
    });
  });

  it("leaves the repository URL undefined when none is given", () => {
    expect(getBuildInfo().repositoryUrl).toBeUndefined();
  });
});
