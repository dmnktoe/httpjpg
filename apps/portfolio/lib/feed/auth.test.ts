// @vitest-environment node
import type { NextRequest } from "next/server";
import { beforeEach, vi } from "vitest";

const envObj = vi.hoisted((): { FEED_PUBLISH_TOKEN?: string } => ({}));
vi.mock("@httpjpg/env", () => ({ env: envObj }));

import { authorizeFeedRequest, feedPublishToken } from "./auth";

const TOKEN = "a-publish-token-that-is-long-enough-0001";

function request(authorization?: string): NextRequest {
  return { headers: new Headers(authorization ? { authorization } : {}) } as NextRequest;
}

beforeEach(() => {
  envObj.FEED_PUBLISH_TOKEN = TOKEN;
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
