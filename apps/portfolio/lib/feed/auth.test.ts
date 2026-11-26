// @vitest-environment node
import type { NextRequest } from "next/server";
import { beforeEach, vi } from "vitest";

const envObj = vi.hoisted(
  (): { FEED_PUBLISH_TOKEN?: string; NEXT_PUBLIC_APP_URL?: string } => ({}),
);
vi.mock("@httpjpg/env", () => ({ env: envObj }));

import { FEED_EDITOR_COOKIE as UI_EDITOR_COOKIE } from "@httpjpg/ui";

import {
  authorizeFeedRequest,
  FEED_EDITOR_COOKIE,
  FEED_SESSION_COOKIE,
  feedPublishToken,
  feedSessionValue,
  isFeedPublishToken,
} from "./auth";

const TOKEN = "a-publish-token-that-is-long-enough-0001";

function request(authorization?: string): NextRequest {
  return { headers: new Headers(authorization ? { authorization } : {}) } as NextRequest;
}

function cookieRequest(
  session: string | undefined,
  init: { method?: string; origin?: string; host?: string } = {},
): NextRequest {
  const headers = new Headers();
  if (init.origin) {
    headers.set("origin", init.origin);
  }
  if (init.host) {
    headers.set("host", init.host);
  }
  return {
    method: init.method ?? "GET",
    headers,
    cookies: {
      get: (name: string) =>
        name === FEED_SESSION_COOKIE && session ? { name, value: session } : undefined,
    },
  } as unknown as NextRequest;
}

beforeEach(() => {
  envObj.FEED_PUBLISH_TOKEN = TOKEN;
  envObj.NEXT_PUBLIC_APP_URL = "https://www.example.test";
});

describe("feedPublishToken", () => {
  it("returns the configured token", () => {
    expect(feedPublishToken()).toBe(TOKEN);
  });

  it("treats a missing or short token as unset", () => {
    envObj.FEED_PUBLISH_TOKEN = undefined;
    expect(feedPublishToken()).toBeNull();
    envObj.FEED_PUBLISH_TOKEN = "too-short";
    expect(feedPublishToken()).toBeNull();
  });
});

describe("authorizeFeedRequest", () => {
  it("lets the right bearer token through", () => {
    expect(authorizeFeedRequest(request(`Bearer ${TOKEN}`))).toBeNull();
    expect(authorizeFeedRequest(request(`bearer   ${TOKEN} `))).toBeNull();
  });

  it("answers 503 when publishing is not configured", async () => {
    envObj.FEED_PUBLISH_TOKEN = "";

    const response = authorizeFeedRequest(request(`Bearer ${TOKEN}`));

    expect(response?.status).toBe(503);
    expect(await response?.json()).toMatchObject({ error: "not_configured" });
  });

  it.each([
    ["no header", undefined],
    ["another scheme", `Basic ${TOKEN}`],
    ["a wrong token", `Bearer ${TOKEN.replace("0001", "0002")}`],
    ["a token of another length", "Bearer nope"],
  ])("answers 401 for %s", async (_label, header) => {
    const response = authorizeFeedRequest(request(header));

    expect(response?.status).toBe(401);
    expect(response?.headers.get("WWW-Authenticate")).toBe("Bearer");
    expect(await response?.json()).toEqual({ error: "unauthorized" });
  });
});

describe("the composer's session cookie", () => {
  const session = () => feedSessionValue(TOKEN);

  it("is its issue time and a signature, not the token itself", () => {
    expect(session()).toMatch(/^[0-9a-z]+\.[0-9a-f]{64}$/);
    expect(session()).not.toContain(TOKEN);
  });

  it("runs out after its lifetime, and a session from the future is no session", () => {
    const day = 24 * 60 * 60 * 1000;
    const read = (value: string) => authorizeFeedRequest(cookieRequest(value));

    expect(read(feedSessionValue(TOKEN, Date.now() - 29 * day))).toBeNull();
    expect(read(feedSessionValue(TOKEN, Date.now() - 31 * day))?.status).toBe(401);
    expect(read(feedSessionValue(TOKEN, Date.now() + day))?.status).toBe(401);
  });

  it("refuses a changed issue time, a malformed value and another token's session", () => {
    const [, signature] = session().split(".");
    const read = (value: string) => authorizeFeedRequest(cookieRequest(value));

    expect(read(`${(Math.floor(Date.now() / 1000) - 1).toString(36)}.${signature}`)?.status).toBe(
      401,
    );
    expect(read("nope")?.status).toBe(401);
    expect(read(`${session()}.x`)?.status).toBe(401);
    expect(read(`ABC.${signature}`)?.status).toBe(401);
    expect(read(feedSessionValue(TOKEN.replace("0001", "0002")))?.status).toBe(401);
  });

  it("opens reads without further proof", () => {
    expect(authorizeFeedRequest(cookieRequest(session()))).toBeNull();
    expect(authorizeFeedRequest(cookieRequest(session(), { method: "HEAD" }))).toBeNull();
  });

  it("opens writes only from the site itself", () => {
    const write = (origin?: string, host?: string) =>
      authorizeFeedRequest(cookieRequest(session(), { method: "PATCH", origin, host }));

    expect(write("https://www.example.test")).toBeNull();
    expect(write("http://localhost:3000", "localhost:3000")).toBeNull();
    expect(write()?.status).toBe(401);
    expect(write("https://evil.test", "www.example.test")?.status).toBe(401);
    expect(write("not a url", "www.example.test")?.status).toBe(401);
  });

  it("still works when the site's own address is not configured", () => {
    envObj.NEXT_PUBLIC_APP_URL = "";

    expect(
      authorizeFeedRequest(
        cookieRequest(session(), { method: "DELETE", origin: "http://a.test", host: "a.test" }),
      ),
    ).toBeNull();
    expect(
      authorizeFeedRequest(cookieRequest(session(), { method: "DELETE", origin: "http://a.test" }))
        ?.status,
    ).toBe(401);
  });

  it("refuses another value, and a wrong bearer token even beside a good cookie", () => {
    expect(authorizeFeedRequest(cookieRequest("f".repeat(64)))?.status).toBe(401);
    expect(authorizeFeedRequest(cookieRequest(undefined))?.status).toBe(401);

    const both = cookieRequest(session());
    both.headers.set("authorization", "Bearer wrong");
    expect(authorizeFeedRequest(both)?.status).toBe(401);
  });

  it("shares the marker's name with the hook that reads it", () => {
    expect(FEED_EDITOR_COOKIE).toBe(UI_EDITOR_COOKIE);
  });
});

describe("isFeedPublishToken", () => {
  it("compares with the configured token", () => {
    expect(isFeedPublishToken(` ${TOKEN} `)).toBe(true);
    expect(isFeedPublishToken("nope")).toBe(false);

    envObj.FEED_PUBLISH_TOKEN = "";
    expect(isFeedPublishToken(TOKEN)).toBe(false);
  });
});
