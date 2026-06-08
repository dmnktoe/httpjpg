const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

export class SpotifyForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Spotify playback is forbidden (missing Premium)") {
    super(message);
    this.name = "SpotifyForbiddenError";
  }
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface SpotifyTrack {
  title: string;
  artist: string;
  artwork: string;
  isPlaying: boolean;
  albumUrl?: string;
  trackUrl?: string;
}

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

export async function getCurrentlyPlaying(accessToken: string): Promise<SpotifyTrack | null> {
  const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204 || response.status === 404) {
    return null;
  }

  if (response.status === 403) {
    throw new SpotifyForbiddenError();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch now playing: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.item) {
    return null;
  }

  const artwork = data.item.album.images[0]?.url || "";

  return {
    title: data.item.name,
    artist: data.item.artists.map((artist: { name: string }) => artist.name).join(", "),
    artwork,
    isPlaying: data.is_playing,
    albumUrl: data.item.album.external_urls?.spotify,
    trackUrl: data.item.external_urls?.spotify,
  };
}
