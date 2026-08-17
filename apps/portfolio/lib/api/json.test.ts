// @vitest-environment node
import { NextRequest } from "next/server";

import { API_ERROR } from "./errors";
import { cacheHeaders, jsonOk, parseJsonBody } from "./json";

describe("cacheHeaders", () => {
  it("disables caching in draft mode", () => {
    expect(cacheHeaders(true, 30)).toEqual({ "Cache-Control": "private, no-store" });
  });

  it("sets s-maxage and stale-while-revalidate from the TTL", () => {
    expect(cacheHeaders(false, 300)).toEqual({
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    });
  });
});

describe("jsonOk", () => {
  it("returns the payload with a 200", async () => {
    const response = jsonOk({ ok: true });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("applies widget cache headers", () => {
    const response = jsonOk({ films: [] }, { cache: { isDraft: false, maxAge: 900 } });

    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=900, stale-while-revalidate=1800",
    );
  });

  it("merges extra headers with the cache policy", () => {
    const response = jsonOk(
      { data: null },
      { headers: { "Access-Control-Allow-Origin": "*" }, cache: { isDraft: true, maxAge: 10 } },
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});

describe("parseJsonBody", () => {
  it("returns the parsed body", async () => {
    const request = new NextRequest("http://localhost/api/ask", {
      method: "POST",
      body: JSON.stringify({ question: "hi" }),
    });

    await expect(parseJsonBody(request)).resolves.toEqual({
      ok: true,
      data: { question: "hi" },
    });
  });

  it("returns invalid_json when the body is not JSON", async () => {
    const request = new NextRequest("http://localhost/api/ask", {
      method: "POST",
      body: "{not json",
    });

    const result = await parseJsonBody(request);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toEqual({ error: API_ERROR.invalidJson });
  });
});
