import { getConfig } from "./config";

export interface WidgetConfig {
  psnUsername?: string;
  psnEnabled: boolean;
  psnTrophyEnabled: boolean;
  discordEnabled: boolean;
  letterboxdEnabled: boolean;
  discogsEnabled: boolean;
  lastfmEnabled: boolean;
  steamEnabled: boolean;
  youtubeEnabled: boolean;
  githubEnabled: boolean;
  redditEnabled: boolean;
  xEnabled: boolean;
  schalkeEnabled: boolean;
  spotifyEnabled: boolean;
  nostalgiaSlideshowEnabled: boolean;
  askEnabled: boolean;
  feedPanelEnabled: boolean;
}

export async function getWidgetConfig(): Promise<WidgetConfig> {
  const config = await getConfig();
  return {
    psnUsername: config?.psn_username,
    psnEnabled: config?.psn_enabled ?? false,
    psnTrophyEnabled: config?.psn_trophy_enabled ?? false,
    discordEnabled: config?.discord_enabled ?? false,
    letterboxdEnabled: config?.letterboxd_enabled ?? false,
    discogsEnabled: config?.discogs_enabled ?? false,
    lastfmEnabled: config?.lastfm_enabled ?? false,
    steamEnabled: config?.steam_enabled ?? false,
    youtubeEnabled: config?.youtube_enabled ?? false,
    githubEnabled: config?.github_enabled ?? false,
    redditEnabled: config?.reddit_enabled ?? false,
    xEnabled: config?.x_enabled ?? false,
    schalkeEnabled: config?.schalke_enabled ?? false,
    spotifyEnabled: config?.spotify_enabled ?? false,
    nostalgiaSlideshowEnabled: config?.nostalgia_slideshow_enabled ?? false,
    askEnabled: config?.ask_enabled ?? false,
    feedPanelEnabled: config?.feed_panel_enabled ?? false,
  };
}

export interface InterfaceConfig {
  customCursorEnabled: boolean;
  mouseTrailEnabled: boolean;
  headerScrollVeilEnabled: boolean;
}

export async function getInterfaceConfig(): Promise<InterfaceConfig> {
  const config = await getConfig();
  return {
    customCursorEnabled: config?.custom_cursor_enabled ?? false,
    mouseTrailEnabled: config?.mouse_trail_enabled ?? false,
    headerScrollVeilEnabled: config?.header_scroll_veil_enabled ?? false,
  };
}

export interface FeatureFlags {
  lastUpdatedBadgeEnabled: boolean;
  webVitalsBadgeEnabled: boolean;
  buildBadgeEnabled: boolean;
  prevNextWorkEnabled: boolean;
  relatedWorkEnabled: boolean;
  rssFeedEnabled: boolean;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const config = await getConfig();
  return {
    lastUpdatedBadgeEnabled: config?.last_updated_badge_enabled ?? false,
    webVitalsBadgeEnabled: config?.web_vitals_badge_enabled ?? false,
    buildBadgeEnabled: config?.build_badge_enabled ?? false,
    prevNextWorkEnabled: config?.prev_next_work_enabled ?? false,
    relatedWorkEnabled: config?.related_work_enabled ?? false,
    rssFeedEnabled: config?.rss_feed_enabled ?? false,
  };
}
