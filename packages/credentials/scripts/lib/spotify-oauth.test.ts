// @vitest-environment node

import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  awaitCallback,
  browserPage,
  describeTokenFailure,
  exchangeCode,
  listenOnLoopback,
  openBrowser,
  REDIRECT_PORT,
  REDIRECT_URI,
  reportAccount,
  requestToken,
} from "./spotify-oauth";

const fetchImpl = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchImpl.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("browserPage", () => {
  it("renders the title in both the document title and the heading", () => {
    const html = browserPage("Spotify connected", "You can close this tab.");
    expect(html).toContain("<title>Spotify connected</title>");
    expect(html).toContain("<h1");
    expect(html).toContain("Spotify connected");
    expect(html).toContain("You can close this tab.");
  });
});

describe("describeTokenFailure", () => {
  it("prefers the error_description, then error, then the raw body", () => {
    expect(
      describeTokenFailure(400, { error: "invalid_grant", error_description: "expired" }, "raw"),
    ).toBe("400: expired");
    expect(describeTokenFailure(401, { error: "invalid_client" }, "raw")).toBe(
      "401: invalid_client",
    );
    expect(describeTokenFailure(500, null, "  gateway timeout  ")).toBe("500: gateway timeout");
    expect(describeTokenFailure(502, null, "   ")).toBe("502: empty response");
  });
});

describe("requestToken", () => {
  it("parses a JSON token payload", async () => {
    fetchImpl.mockResolvedValueOnce(
      new Response(JSON.stringify({ refresh_token: "rt", access_token: "at" }), { status: 200 }),
    );

    await expect(
      requestToken({ grant_type: "refresh_token", refresh_token: "rt" }, "id", "secret", fetchImpl),
    ).resolves.toEqual({
      status: 200,
      payload: { refresh_token: "rt", access_token: "at" },
      raw: JSON.stringify({ refresh_token: "rt", access_token: "at" }),
    });
  });

  it("returns a null payload when the body is not JSON", async () => {
    fetchImpl.mockResolvedValueOnce(new Response("<html>nope</html>", { status: 502 }));

    await expect(
      requestToken({ grant_type: "client_credentials" }, "id", "secret", fetchImpl),
    ).resolves.toEqual({
      status: 502,
      payload: null,
      raw: "<html>nope</html>",
    });
  });
});

describe("exchangeCode", () => {
  it("returns the refresh token on a 200", async () => {
    fetchImpl.mockResolvedValueOnce(
      new Response(JSON.stringify({ refresh_token: "rt" }), { status: 200 }),
    );

    await expect(exchangeCode("code", "id", "secret", fetchImpl)).resolves.toBe("rt");
  });

  it("throws when Spotify omits the refresh token", async () => {
    fetchImpl.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 }),
    );

    await expect(exchangeCode("code", "id", "secret", fetchImpl)).rejects.toThrow(
      "token exchange failed · 400: invalid_grant",
    );
  });
});

describe("reportAccount", () => {
  it("returns null when there is no access token", async () => {
    await expect(reportAccount(undefined, fetchImpl)).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns the display name when the profile request succeeds", async () => {
    fetchImpl.mockResolvedValueOnce(
      new Response(JSON.stringify({ display_name: "httpjpg", id: "abc" }), { status: 200 }),
    );
    await expect(reportAccount("at", fetchImpl)).resolves.toBe("httpjpg");
  });

  it("falls back to the id, then unknown account", async () => {
    fetchImpl.mockResolvedValueOnce(new Response(JSON.stringify({ id: "abc" }), { status: 200 }));
    await expect(reportAccount("at", fetchImpl)).resolves.toBe("abc");

    fetchImpl.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    await expect(reportAccount("at", fetchImpl)).resolves.toBe("unknown account");
  });

  it("returns null when the profile request fails or throws", async () => {
    fetchImpl.mockResolvedValueOnce(new Response("nope", { status: 401 }));
    await expect(reportAccount("at", fetchImpl)).resolves.toBeNull();

    fetchImpl.mockRejectedValueOnce(new Error("offline"));
    await expect(reportAccount("at", fetchImpl)).resolves.toBeNull();
  });
});

describe("openBrowser", () => {
  it("does not throw when the opener cannot be spawned", () => {
    expect(() => openBrowser("https://example.com")).not.toThrow();
  });
});

describe("listenOnLoopback / awaitCallback", () => {
  it("rejects with a port-in-use message when 8888 is taken", async () => {
    const blocker = createServer();
    await new Promise<void>((resolve, reject) => {
      blocker.once("error", reject);
      blocker.listen(REDIRECT_PORT, "127.0.0.1", () => resolve());
    });

    try {
      await expect(listenOnLoopback()).rejects.toThrow(/already in use/);
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()));
    }
  });

  it("exchanges a matching callback for the authorization code", async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const state = randomUUID();
    const pending = awaitCallback(server, state);

    const response = await fetch(`http://127.0.0.1:${port}/callback?code=the-code&state=${state}`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Spotify connected");
    await expect(pending).resolves.toBe("the-code");
  });

  it("404s paths that are not /callback and still accepts a later callback", async () => {
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const { port } = server.address() as AddressInfo;
    const pending = awaitCallback(server, "state");

    const missed = await fetch(`http://127.0.0.1:${port}/health`);
    expect(missed.status).toBe(404);

    const ok = await fetch(`http://127.0.0.1:${port}/callback?code=later&state=state`);
    expect(ok.status).toBe(200);
    await expect(pending).resolves.toBe("later");
  });

  it("rejects when Spotify returns an error, a mismatched state, or no code", async () => {
    async function hit(search: string, message: string) {
      const server = createServer();
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
      const { port } = server.address() as AddressInfo;
      const pending = awaitCallback(server, "expected");
      const rejected = expect(pending).rejects.toThrow(message);
      const response = await fetch(`http://127.0.0.1:${port}/callback?${search}`);
      expect(response.status).toBe(400);
      await rejected;
    }

    await hit("error=access_denied&state=expected", 'Spotify returned "access_denied"');
    await hit("code=x&state=other", "Callback state did not match");
    await hit("state=expected", "Callback carried no authorization code");
  });
});

describe("REDIRECT_URI", () => {
  it("is registered on loopback port 8888", () => {
    expect(REDIRECT_URI).toBe("http://127.0.0.1:8888/callback");
  });
});
