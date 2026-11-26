import type { FeedPostEntry } from "../queries/feed";

const MAX_LENGTH = 60;

export function toTickerItems(posts: FeedPostEntry[]): string[] {
  const items: string[] = [];
  for (const post of posts) {
    const line = post.content.caption?.trim().split("\n")[0]?.trim();
    if (line) {
      items.push(line.length > MAX_LENGTH ? `${line.slice(0, MAX_LENGTH - 1).trimEnd()}…` : line);
    }
  }
  return items;
}
