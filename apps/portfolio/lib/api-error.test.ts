// @vitest-environment node
import { describe, expect, it } from "vitest";

import { API_ERROR, jsonError } from "./api-error";

describe("jsonError", () => {
  it("returns the code and status on its own", async () => {
    const response = jsonError(API_ERROR.invalidJson, 400);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_json" });
  });

  it("adds the message and reason when given", async () => {
    const response = jsonError(API_ERROR.upstream, 503, { message: "down", reason: "auth" });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "upstream_unavailable",
      message: "down",
      reason: "auth",
    });
  });

  it("keeps the caller's headers", () => {
    const response = jsonError(API_ERROR.internal, 500, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
