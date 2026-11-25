export interface RedditKarma {
  username: string;
  karma: number;
  url: string;
}

const REDDIT_USERNAME = /^[\w-]{3,20}$/;

export function isRedditUsername(value: unknown): value is string {
  return typeof value === "string" && REDDIT_USERNAME.test(value);
}

export function readRedditKarma(username: unknown, karma: unknown): RedditKarma | null {
  const count = typeof karma === "string" ? Number.parseInt(karma, 10) : karma;
  if (!isRedditUsername(username) || typeof count !== "number" || !Number.isFinite(count)) {
    return null;
  }
  return {
    username,
    karma: Math.trunc(count),
    url: `https://www.reddit.com/user/${username}/`,
  };
}
