import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchDiscordPresence } from "./discord";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function lanyardResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => ({ data }),
  } as Response;
}

describe("fetchDiscordPresence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the Lanyard endpoint for the given user id", async () => {
    mockFetch.mockResolvedValueOnce(lanyardResponse({ discord_status: "online", activities: [] }));
    await fetchDiscordPresence("123");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.lanyard.rest/v1/users/123",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns offline as the default status when Lanyard omits it", async () => {
    mockFetch.mockResolvedValueOnce(lanyardResponse({ activities: [] }));
    const result = await fetchDiscordPresence("123");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.presence.status).toBe("offline");
      expect(result.presence.activity).toBeNull();
      expect(result.presence.activityDetails).toBeNull();
    }
  });

  it("derives the avatar url from the user hash", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        discord_status: "online",
        discord_user: { username: "dom", avatar: "abc123" },
        activities: [],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.username).toBe("dom");
    expect(result.presence.avatar).toBe("https://cdn.discordapp.com/avatars/42/abc123.png");
  });

  it("returns a null avatar when no avatar hash is provided", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        discord_status: "online",
        discord_user: { username: "dom" },
        activities: [],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.avatar).toBeNull();
  });

  it("surfaces a playing-game activity with platform and playtime", async () => {
    const startedAt = Date.now() - 2 * 60 * 60 * 1000 - 30 * 60 * 1000; // 2h 30m ago
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        discord_status: "online",
        activities: [
          {
            type: 0,
            name: "Cyberpunk 2077™",
            platform: "desktop",
            application_id: "app-1",
            timestamps: { start: startedAt },
            assets: { small_image: "icon_hash" },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activity).toBe("Playing Cyberpunk 2077 on DESKTOP");
    expect(result.presence.activityDetails).toEqual({
      type: "game",
      name: "Cyberpunk 2077",
      platform: "desktop",
      playtime: "2h 30m",
      icon: "https://cdn.discordapp.com/app-assets/app-1/icon_hash.png",
    });
  });

  it("formats a sub-hour playtime as minutes only", async () => {
    const startedAt = Date.now() - 12 * 60 * 1000;
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [
          {
            type: 0,
            name: "Game",
            timestamps: { start: startedAt },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activityDetails).toMatchObject({ playtime: "12m" });
  });

  it("skips Spotify game activities", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [{ type: 0, name: "Spotify" }],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activity).toBeNull();
    expect(result.presence.activityDetails).toBeNull();
  });

  it("falls back to a custom status when no game is being played", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        discord_status: "idle",
        activities: [{ type: 4, state: "vibing", emoji: { name: "🌴" } }],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activity).toBe("🌴 vibing");
    expect(result.presence.activityDetails).toEqual({
      type: "custom",
      text: "vibing",
      emoji: "🌴",
    });
  });

  it("omits the emoji prefix when the custom status has no emoji", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [{ type: 4, state: "heads down" }],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activity).toBe("heads down");
  });

  it("resolves mp:external asset references through the media proxy", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [
          {
            type: 0,
            name: "Game",
            assets: { small_image: "mp:external/abc/foo.png" },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activityDetails).toMatchObject({
      icon: "https://media.discordapp.net/external/abc/foo.png",
    });
  });

  it("returns full http asset references unchanged", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [
          {
            type: 0,
            name: "Game",
            assets: { small_image: "https://cdn.example.com/icon.png" },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activityDetails).toMatchObject({
      icon: "https://cdn.example.com/icon.png",
    });
  });

  it("falls back to large_image when small_image is missing", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [
          {
            type: 0,
            name: "Game",
            application_id: "app-1",
            assets: { large_image: "large_hash" },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activityDetails).toMatchObject({
      icon: "https://cdn.discordapp.com/app-assets/app-1/large_hash.png",
    });
  });

  it("returns a null icon when a bare hash has no application id to resolve against", async () => {
    mockFetch.mockResolvedValueOnce(
      lanyardResponse({
        activities: [
          {
            type: 0,
            name: "Game",
            assets: { small_image: "hash_no_app" },
          },
        ],
      }),
    );
    const result = await fetchDiscordPresence("42");
    if (!result.ok) throw new Error("expected ok");
    expect(result.presence.activityDetails).toMatchObject({ icon: null });
  });

  it("returns a not-ok result for non-200 responses with a join message", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) } as Response);
    const result = await fetchDiscordPresence("nobody");
    expect(result).toEqual({
      ok: false,
      status: 404,
      message: expect.stringContaining("Join discord.gg/lanyard"),
    });
  });

  it("returns a not-ok result when the body has no data field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    const result = await fetchDiscordPresence("42");
    expect(result).toEqual({
      ok: false,
      status: 502,
      message: expect.stringContaining("Unexpected response"),
    });
  });

  it("translates an abort timeout into a 504", async () => {
    mockFetch.mockRejectedValueOnce(Object.assign(new DOMException("aborted", "AbortError")));
    const result = await fetchDiscordPresence("42");
    expect(result).toEqual({
      ok: false,
      status: 504,
      message: expect.stringContaining("timed out"),
    });
  });

  it("rethrows non-abort fetch errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    await expect(fetchDiscordPresence("42")).rejects.toThrow("network down");
  });
});
