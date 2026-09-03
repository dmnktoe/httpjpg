// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { diagnoseRejection, formatDate, npssoExpiry, NPSSO_LIFETIME_DAYS } from "./psn-auth";

describe("formatDate", () => {
  it("prints an ISO calendar date", () => {
    expect(formatDate(new Date("2026-09-02T12:00:00.000Z"))).toBe("2026-09-02");
  });
});

describe("npssoExpiry", () => {
  it("is NPSSO_LIFETIME_DAYS after the mint instant", () => {
    const from = Date.parse("2026-01-01T00:00:00.000Z");
    expect(npssoExpiry(from).getTime()).toBe(from + NPSSO_LIFETIME_DAYS * 86_400_000);
  });
});

describe("diagnoseRejection", () => {
  it("treats a 3xx as Sony being reachable and the cookie being bad", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: "/" } }));
    await expect(diagnoseRejection(fetchImpl)).resolves.toContain("expired or malformed");
  });

  it("reports a non-redirect status as interference", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("nope", { status: 200 }));
    await expect(diagnoseRejection(fetchImpl)).resolves.toContain("answered 200");
  });

  it("reports a network failure separately from a bad cookie", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("ENOTFOUND"));
    await expect(diagnoseRejection(fetchImpl)).resolves.toContain("sony unreachable (ENOTFOUND)");
  });
});
