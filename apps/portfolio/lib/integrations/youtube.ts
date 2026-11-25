import { fetchWithTimeout, readJson } from "./http";
import { PIXEL_GRID, pixelateImage } from "./pixelate";

export interface YoutubeChannel {
  id: string;
  title: string;
  avatar: string | null;
  url: string;
  subscriberCount: number | null;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  publishedAt: string | null;
}

export interface YoutubeStatus {
  channel: YoutubeChannel;
  videos: YoutubeVideo[];
}

export type YoutubeFetchResult =
  | { ok: true; status: YoutubeStatus }
  | { ok: false; status: number; message: string };

interface YoutubeThumbnails {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
}

interface YoutubeChannelItem {
  id?: string;
  snippet?: { title?: string; customUrl?: string; thumbnails?: YoutubeThumbnails };
  statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
}

interface YoutubeChannelsResponse {
  items?: YoutubeChannelItem[];
}

interface YoutubePlaylistItem {
  snippet?: {
    title?: string;
    thumbnails?: YoutubeThumbnails;
    resourceId?: { videoId?: string };
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
}

interface YoutubePlaylistItemsResponse {
  items?: YoutubePlaylistItem[];
}

const DEFAULT_LIMIT = 4;
const API_URL = "https://www.googleapis.com/youtube/v3";

const UNAVAILABLE_TITLES = new Set(["Private video", "Deleted video"]);

const CHANNEL_ID = /^UC[\w-]{22}$/;

export function isYoutubeChannelId(value: unknown): value is string {
  return typeof value === "string" && CHANNEL_ID.test(value);
}

function pickThumbnail(thumbnails: YoutubeThumbnails | undefined): string | null {
  return thumbnails?.medium?.url || thumbnails?.high?.url || thumbnails?.default?.url || null;
}

export function parseChannel(body: YoutubeChannelsResponse): YoutubeChannel | null {
  const item = body.items?.[0];
  const title = item?.snippet?.title;
  if (!item?.id || !title) {
    return null;
  }
  const handle = item.snippet?.customUrl;
  const count = Number.parseInt(item.statistics?.subscriberCount ?? "", 10);
  return {
    id: item.id,
    title,
    avatar: pickThumbnail(item.snippet?.thumbnails),
    url: handle
      ? `https://www.youtube.com/${handle}`
      : `https://www.youtube.com/channel/${item.id}`,
    subscriberCount:
      item.statistics?.hiddenSubscriberCount || !Number.isFinite(count) ? null : count,
  };
}

export function parseUploads(
  body: YoutubePlaylistItemsResponse,
  limit = DEFAULT_LIMIT,
): YoutubeVideo[] {
  if (limit <= 0) {
    return [];
  }
  const videos: YoutubeVideo[] = [];
  for (const item of body.items ?? []) {
    const id = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title?.trim();
    if (!id || !title || UNAVAILABLE_TITLES.has(title)) {
      continue;
    }
    videos.push({
      id,
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: pickThumbnail(item.snippet?.thumbnails),
      publishedAt: item.contentDetails?.videoPublishedAt ?? null,
    });
  }
  return videos.slice(0, limit);
}

export async function fetchYoutubeStatus(
  channelId: string,
  apiKey: string,
  limit = DEFAULT_LIMIT,
): Promise<YoutubeFetchResult> {
  const hint = "Check YOUTUBE_API_KEY and the channel id (UC…).";
  const channelParams = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id: channelId,
    key: apiKey,
  });

  const channelResult = await fetchWithTimeout(`${API_URL}/channels?${channelParams}`, {
    label: "YouTube",
    hint,
  });
  if (!channelResult.ok) {
    return channelResult;
  }
  const channelBody = await readJson<YoutubeChannelsResponse>(channelResult.response, "YouTube");
  if (!channelBody.ok) {
    return channelBody;
  }
  const channel = parseChannel(channelBody.data ?? {});
  if (!channel) {
    return { ok: false, status: 404, message: `No YouTube channel ${channelId}. ${hint}` };
  }

  const uploads =
    channelBody.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ??
    `UU${channelId.slice(2)}`;
  const uploadParams = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId: uploads,
    maxResults: String(Math.min(50, Math.max(1, limit) * 2)),
    key: apiKey,
  });
  const uploadsResult = await fetchWithTimeout(`${API_URL}/playlistItems?${uploadParams}`, {
    label: "YouTube",
    hint,
  });
  if (!uploadsResult.ok) {
    return uploadsResult.status === 404
      ? {
          ok: true,
          status: {
            channel: {
              ...channel,
              avatar: await pixelateImage(channel.avatar, {
                width: PIXEL_GRID.thumb,
                height: PIXEL_GRID.thumb,
              }),
            },
            videos: [],
          },
        }
      : uploadsResult;
  }
  const uploadsBody = await readJson<YoutubePlaylistItemsResponse>(
    uploadsResult.response,
    "YouTube",
  );
  if (!uploadsBody.ok) {
    return uploadsBody;
  }

  const avatar = await pixelateImage(channel.avatar, {
    width: PIXEL_GRID.thumb,
    height: PIXEL_GRID.thumb,
  });
  return {
    ok: true,
    status: {
      channel: { ...channel, avatar },
      videos: parseUploads(uploadsBody.data ?? {}, limit),
    },
  };
}
