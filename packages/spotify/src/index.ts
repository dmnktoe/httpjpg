export { type ExtractedColor, extractVibrantColor } from "./extract-color";
export {
  clearAccessTokenCache,
  getAccessToken,
  getCurrentlyPlaying,
  SpotifyForbiddenError,
  SpotifyUnauthorizedError,
} from "./api";
export {
  type NowPlayingData,
  type NowPlayingErrorCode,
  type UseNowPlayingOptions,
  type UseNowPlayingReturn,
  useNowPlaying,
} from "./use-now-playing";
