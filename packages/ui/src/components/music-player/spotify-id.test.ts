import { getSpotifyId } from "./spotify-id";

describe("getSpotifyId", () => {
  it("parses a spotify: URI", () => {
    expect(getSpotifyId("spotify:album:123abc")).toEqual({ type: "album", id: "123abc" });
  });

  it("parses an open.spotify.com URL", () => {
    expect(getSpotifyId("https://open.spotify.com/track/456def")).toEqual({
      type: "track",
      id: "456def",
    });
  });

  it("parses a playlist URL", () => {
    expect(getSpotifyId("https://open.spotify.com/playlist/789ghi?si=x")).toEqual({
      type: "playlist",
      id: "789ghi",
    });
  });

  it("falls back to a raw id treated as a track", () => {
    expect(getSpotifyId("plainid")).toEqual({ type: "track", id: "plainid" });
  });

  it("falls back to track for an unknown URI type", () => {
    expect(getSpotifyId("spotify:show:podcast")).toEqual({
      type: "track",
      id: "spotify:show:podcast",
    });
  });
});
