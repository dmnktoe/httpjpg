// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { STORYBLOK_PREVIEW_SECRET: "topsecret" },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { enable } = vi.hoisted(() => ({ enable: vi.fn() }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ enable })),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/draft", () => {
  it("rejects a request without a secret", async () => {
    const response = await GET(new NextRequest("http://localhost/api/draft"));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid secret and reports it", async () => {
    const response = await GET(new NextRequest("http://localhost/api/draft?secret=wrong"));
    expect(response.status).toBe(401);
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("enables draft mode and redirects to the slug with forwarded params", async () => {
    const request = new NextRequest(
      "http://localhost/api/draft?secret=topsecret&slug=work/foo&_storyblok=1",
    );

    const response = await GET(request);

    expect(enable).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    const location = response.headers.get("location") || "";
    expect(location).toContain("/work/foo");
    expect(location).toContain("_storyblok=1");
    expect(location).toContain("_draft=1");
  });

  it("redirects to the root for the home slug", async () => {
    const request = new NextRequest("http://localhost/api/draft?secret=topsecret&slug=home");
    const response = await GET(request);
    const location = response.headers.get("location") || "";
    expect(new URL(location).pathname).toBe("/");
  });
});
