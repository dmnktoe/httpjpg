// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { disable } = vi.hoisted(() => ({ disable: vi.fn() }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ disable })),
}));

import { NextRequest } from "next/server";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/exit-draft", () => {
  it("disables draft mode and redirects to the cleaned redirect param", async () => {
    const request = new NextRequest("http://localhost/api/exit-draft?redirect=/about%3F_draft%3D1");

    const response = await GET(request);

    expect(disable).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    const location = response.headers.get("location") || "";
    expect(location).not.toContain("_draft");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("falls back to the referer header when no redirect param is set", async () => {
    const request = new NextRequest("http://localhost/api/exit-draft", {
      headers: { referer: "http://localhost/work" },
    });

    const response = await GET(request);

    expect(response.headers.get("location")).toContain("/work");
  });
});
