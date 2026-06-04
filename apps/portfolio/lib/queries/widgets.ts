import { getConfig } from "./config";

export interface WidgetConfig {
  psnUsername?: string;
  psnEnabled: boolean;
  spotifyEnabled: boolean;
  letterboxdEnabled: boolean;
  nostalgiaSlideshowEnabled: boolean;
  customCursorEnabled: boolean;
  mouseTrailEnabled: boolean;
}

export async function getWidgetConfig(): Promise<WidgetConfig> {
  const config = await getConfig();
  return {
    psnUsername: config?.psn_username,
    psnEnabled: config?.psn_enabled ?? false,
    spotifyEnabled: config?.spotify_enabled ?? true,
    letterboxdEnabled: config?.letterboxd_enabled ?? false,
    nostalgiaSlideshowEnabled: config?.nostalgia_slideshow_enabled ?? false,
    customCursorEnabled: config?.custom_cursor_enabled ?? true,
    mouseTrailEnabled: config?.mouse_trail_enabled ?? true,
  };
}

export interface FeatureFlags {
  lastUpdatedBadgeEnabled: boolean;
  prevNextWorkEnabled: boolean;
  rssFeedEnabled: boolean;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const config = await getConfig();
  return {
    lastUpdatedBadgeEnabled: config?.last_updated_badge_enabled ?? true,
    prevNextWorkEnabled: config?.prev_next_work_enabled ?? true,
    rssFeedEnabled: config?.rss_feed_enabled ?? true,
  };
}
