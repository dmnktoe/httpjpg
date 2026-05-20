export type NowPlayingSize = "sm" | "md" | "lg";

export interface NowPlayingSizeConfig {
  width: number;
  height: number;
  artworkSize: number;
  fontSize: { title: string; artist: string };
  padding: number;
  gap: number;
}

export const sizeConfig: Record<NowPlayingSize, NowPlayingSizeConfig> = {
  sm: {
    width: 240,
    height: 56,
    artworkSize: 40,
    fontSize: { title: "0.75rem", artist: "0.6875rem" },
    padding: 8,
    gap: 8,
  },
  md: {
    width: 280,
    height: 64,
    artworkSize: 48,
    fontSize: { title: "0.875rem", artist: "0.75rem" },
    padding: 8,
    gap: 10,
  },
  lg: {
    width: 320,
    height: 72,
    artworkSize: 56,
    fontSize: { title: "1rem", artist: "0.875rem" },
    padding: 10,
    gap: 12,
  },
};
