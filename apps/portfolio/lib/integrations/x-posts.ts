import { decodeEntities } from "./html";
import { fetchWithTimeout, readJson } from "./http";

export interface XProfile {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  followerCount: number | null;
}

export interface XPost {
  id: string;
  text: string;
  url: string;
  createdAt: string | null;
  hasMedia: boolean;
  isSensitive: boolean;
  isQuote: boolean;
}

export interface XTimeline {
  profile: XProfile;
  posts: XPost[];
}

export type XFetchResult =
  | { ok: true; timeline: XTimeline }
  | { ok: false; status: number; message: string };

interface TweetApiUser {
  id?: string;
  username?: string;
  name?: string;
  avatar?: string;
  followerCount?: number;
}

interface TweetApiMedia {
  type?: string;
}

interface TweetApiTweet {
  id?: string;
  text?: string;
  type?: string;
  createdAt?: string;
  author?: TweetApiUser;
  media?: TweetApiMedia[];
  possiblySensitive?: boolean;
}

interface TweetApiUserResponse {
  data?: TweetApiUser;
}

interface TweetApiTweetsResponse {
  data?: TweetApiTweet[];
}

const DEFAULT_LIMIT = 4;
const HINT = "Check TWEETAPI_KEY, the X username, and the plan's rate limit.";

const X_USERNAME = /^\w{1,15}$/;

export function isXUsername(value: unknown): value is string {
  return typeof value === "string" && X_USERNAME.test(value);
}

export function cleanPostText(raw: string): string {
  return decodeEntities(raw)
    .replace(/\s*https:\/\/t\.co\/\w+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toProfile(user: TweetApiUser | undefined): XProfile | null {
  if (!user?.id || !user.username) {
    return null;
  }
  const followers = user.followerCount;
  return {
    id: user.id,
    username: user.username,
    name: user.name?.trim() || user.username,
    avatar: user.avatar || null,
    followerCount:
      typeof followers === "number" && Number.isFinite(followers) && followers >= 0
        ? followers
        : null,
  };
}

export function toPost(tweet: TweetApiTweet, fallbackUsername: string): XPost | null {
  if (!tweet.id || tweet.type === "retweet") {
    return null;
  }

  const text = cleanPostText(tweet.text ?? "");
  const hasMedia = (tweet.media?.length ?? 0) > 0;
  if (!text && !hasMedia) {
    return null;
  }

  const username = tweet.author?.username || fallbackUsername;

  return {
    id: tweet.id,
    text,
    url: `https://x.com/${username}/status/${tweet.id}`,
    createdAt: tweet.createdAt ?? null,
    hasMedia,
    isSensitive: tweet.possiblySensitive === true,
    isQuote: tweet.type === "quote",
  };
}

export interface XTimelineRequest {
  apiUrl: string;
  apiKey: string;
  username: string;
  limit?: number;
}

export async function fetchXTimeline({
  apiUrl,
  apiKey,
  username,
  limit = DEFAULT_LIMIT,
}: XTimelineRequest): Promise<XFetchResult> {
  const base = apiUrl.replace(/\/+$/, "");
  const headers = { "X-API-Key": apiKey, Accept: "application/json" };

  const lookup = await fetchWithTimeout(
    `${base}/user/by-username?username=${encodeURIComponent(username)}`,
    { label: "TweetAPI", hint: HINT, headers },
  );
  if (!lookup.ok) {
    return lookup;
  }

  const user = await readJson<TweetApiUserResponse>(lookup.response, "TweetAPI");
  if (!user.ok) {
    return user;
  }

  const profile = toProfile(user.data?.data);
  if (!profile) {
    return {
      ok: false,
      status: 502,
      message: "Unexpected response from the TweetAPI user endpoint.",
    };
  }

  const timeline = await fetchWithTimeout(
    `${base}/user/tweets?userId=${encodeURIComponent(profile.id)}`,
    { label: "TweetAPI", hint: HINT, headers },
  );
  if (!timeline.ok) {
    return timeline;
  }

  const body = await readJson<TweetApiTweetsResponse>(timeline.response, "TweetAPI");
  if (!body.ok) {
    return body;
  }
  if (!Array.isArray(body.data?.data)) {
    return {
      ok: false,
      status: 502,
      message: "Unexpected response from the TweetAPI tweets endpoint.",
    };
  }

  const posts = body.data.data
    .map((tweet) => toPost(tweet, profile.username))
    .filter((post): post is XPost => post !== null)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, limit);

  return { ok: true, timeline: { profile, posts } };
}
