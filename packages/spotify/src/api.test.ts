// @vitest-environment node
import { beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";

import {
  clearAccessTokenCache,
  getAccessToken,
  getCurrentlyPlaying,
  SpotifyForbiddenError,
} from "./api";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

describe("Spotify API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAccessTokenCache();
  });

  describe("getAccessToken", () => {
    it("should successfully get access token", async () => {
      const mockResponse = {
        access_token: "mock_access_token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "user-read-currently-playing",
      };

      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const token = await getAccessToken("client_id", "client_secret", "refresh_token");

      expect(token).toBe("mock_access_token");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://accounts.spotify.com/api/token",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        }),
      );
    });

    it("should throw error on failed request", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(getAccessToken("client_id", "client_secret", "refresh_token")).rejects.toThrow(
        "Failed to get access token: Unauthorized",
      );
    });

    it("should encode credentials in base64", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token" }),
      } as Response);

      await getAccessToken("test_id", "test_secret", "refresh");

      const call = (global.fetch as MockedFunction<typeof fetch>).mock.calls[0];
      const headers = (call[1] as RequestInit)?.headers as Record<string, string>;

      expect(headers.Authorization).toContain("Basic ");
    });

    it("should reuse a cached token until it expires", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "cached_token", expires_in: 3600 }),
      } as Response);

      const first = await getAccessToken("client_id", "client_secret", "refresh_token");
      const second = await getAccessToken("client_id", "client_secret", "refresh_token");

      expect(first).toBe("cached_token");
      expect(second).toBe("cached_token");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should refetch once the cached token is about to expire", async () => {
      vi.useFakeTimers();
      try {
        (global.fetch as MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: "first_token", expires_in: 3600 }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: "second_token", expires_in: 3600 }),
          } as Response);

        await getAccessToken("client_id", "client_secret", "refresh_token");
        vi.advanceTimersByTime(3600 * 1000);

        const token = await getAccessToken("client_id", "client_secret", "refresh_token");

        expect(token).toBe("second_token");
        expect(global.fetch).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should dedupe concurrent requests into one token fetch", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "shared_token", expires_in: 3600 }),
      } as Response);

      const [a, b] = await Promise.all([
        getAccessToken("client_id", "client_secret", "refresh_token"),
        getAccessToken("client_id", "client_secret", "refresh_token"),
      ]);

      expect(a).toBe("shared_token");
      expect(b).toBe("shared_token");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should not serve a cached token to different credentials", async () => {
      (global.fetch as MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "token_a", expires_in: 3600 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "token_b", expires_in: 3600 }),
        } as Response);

      const a = await getAccessToken("id_a", "secret_a", "refresh_a");
      const b = await getAccessToken("id_b", "secret_b", "refresh_b");

      expect(a).toBe("token_a");
      expect(b).toBe("token_b");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should not cache failures", async () => {
      (global.fetch as MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Unauthorized",
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "recovered_token", expires_in: 3600 }),
        } as Response);

      await expect(getAccessToken("client_id", "client_secret", "refresh_token")).rejects.toThrow(
        "Failed to get access token: Unauthorized",
      );
      const token = await getAccessToken("client_id", "client_secret", "refresh_token");

      expect(token).toBe("recovered_token");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("getCurrentlyPlaying", () => {
    it("should return track data when playing", async () => {
      const mockSpotifyResponse = {
        is_playing: true,
        item: {
          name: "Test Song",
          artists: [{ name: "Test Artist" }],
          album: {
            images: [
              { url: "https://example.com/large.jpg", height: 640 },
              { url: "https://example.com/medium.jpg", height: 300 },
              { url: "https://example.com/small.jpg", height: 64 },
            ],
            external_urls: {
              spotify: "https://spotify.com/album/123",
            },
          },
          external_urls: {
            spotify: "https://spotify.com/track/456",
          },
        },
      };

      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSpotifyResponse,
      } as Response);

      const result = await getCurrentlyPlaying("access_token");

      expect(result).toEqual({
        title: "Test Song",
        artist: "Test Artist",
        artwork: "https://example.com/large.jpg",
        isPlaying: true,
        albumUrl: "https://spotify.com/album/123",
        trackUrl: "https://spotify.com/track/456",
      });
    });

    it("should return null when nothing is playing", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

      const result = await getCurrentlyPlaying("access_token");
      expect(result).toBeNull();
    });

    it("should throw SpotifyForbiddenError when playback is forbidden (e.g. no Premium)", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      } as Response);

      await expect(getCurrentlyPlaying("access_token")).rejects.toBeInstanceOf(
        SpotifyForbiddenError,
      );
    });

    it("should throw error on API failure", async () => {
      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      await expect(getCurrentlyPlaying("access_token")).rejects.toThrow(
        "Failed to fetch now playing: Unauthorized",
      );
    });

    it("should handle multiple artists", async () => {
      const mockResponse = {
        is_playing: true,
        item: {
          name: "Collaboration",
          artists: [{ name: "Artist 1" }, { name: "Artist 2" }, { name: "Artist 3" }],
          album: {
            images: [{ url: "https://example.com/img.jpg" }],
            external_urls: { spotify: "album_url" },
          },
          external_urls: { spotify: "track_url" },
        },
      };

      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await getCurrentlyPlaying("token");
      expect(result?.artist).toBe("Artist 1, Artist 2, Artist 3");
    });

    it("should handle missing album artwork gracefully", async () => {
      const mockResponse = {
        is_playing: true,
        item: {
          name: "No Artwork",
          artists: [{ name: "Artist" }],
          album: {
            images: [],
            external_urls: { spotify: "album" },
          },
          external_urls: { spotify: "track" },
        },
      };

      (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await getCurrentlyPlaying("token");
      expect(result?.artwork).toBe("");
    });
  });
});
