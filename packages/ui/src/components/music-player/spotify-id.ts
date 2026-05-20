export type SpotifyEmbedType = "track" | "album" | "playlist";

function isEmbedType(value: string): value is SpotifyEmbedType {
  return value === "track" || value === "album" || value === "playlist";
}

/**
 * Parse a Spotify URL or URI down to its embed `{type, id}` pair.
 * Falls back to treating the input as a raw track id.
 */
export function getSpotifyId(src: string): { type: SpotifyEmbedType; id: string } {
  if (src.startsWith("spotify:")) {
    const [, type, id] = src.split(":");
    if (type && id && isEmbedType(type)) {
      return { type, id };
    }
  }

  const urlMatch = src.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return {
      type: urlMatch[1] as SpotifyEmbedType,
      id: urlMatch[2],
    };
  }

  return { type: "track", id: src };
}
