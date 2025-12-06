/**
 * @jest-environment node
 */
import { describe, expect, it, jest } from "@jest/globals";
import { getAccessToken, getCurrentlyPlaying } from "./spotify-api";

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("Spotify API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccessToken", () => {
    it("should successfully get access token", async () => {
      const mockResponse = {
        access_token: "mock_access_token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "user-read-currently-playing",
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockResponse,
        } as Response,
      );

      const token = await getAccessToken(
        "client_id",
        "client_secret",
        "refresh_token",
      );

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
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: false,
          statusText: "Unauthorized",
        } as Response,
      );

      await expect(
        getAccessToken("client_id", "client_secret", "refresh_token"),
      ).rejects.toThrow("Failed to get access token: Unauthorized");
    });

    it("should encode credentials in base64", async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ access_token: "token" }),
        } as Response,
      );

      await getAccessToken("test_id", "test_secret", "refresh");

      const call = (global.fetch as jest.MockedFunction<typeof fetch>).mock
        .calls[0];
      const headers = (call[1] as RequestInit)?.headers as Record<
        string,
        string
      >;

      // Base64 of "test_id:test_secret"
      expect(headers.Authorization).toContain("Basic ");
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

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 200,
          json: async () => mockSpotifyResponse,
        } as Response,
      );

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
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 204,
        } as Response,
      );

      const result = await getCurrentlyPlaying("access_token");
      expect(result).toBeNull();
    });

    it("should throw error on API failure", async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        } as Response,
      );

      await expect(getCurrentlyPlaying("access_token")).rejects.toThrow(
        "Failed to fetch now playing: Unauthorized",
      );
    });

    it("should handle multiple artists", async () => {
      const mockResponse = {
        is_playing: true,
        item: {
          name: "Collaboration",
          artists: [
            { name: "Artist 1" },
            { name: "Artist 2" },
            { name: "Artist 3" },
          ],
          album: {
            images: [{ url: "https://example.com/img.jpg" }],
            external_urls: { spotify: "album_url" },
          },
          external_urls: { spotify: "track_url" },
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as Response,
      );

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

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as Response,
      );

      const result = await getCurrentlyPlaying("token");
      expect(result?.artwork).toBe("");
    });
  });
});
