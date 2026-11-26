import type { FeedPostEntry } from "../queries/feed";

const MAX_LENGTH = 60;

export function toTickerItems(posts: FeedPostEntry[]): string[] {
  const items: string[] = [];
  for (const post of posts) {
    const line = post.content.caption?.trim().split("\n")[0]?.trim();
    if (line) {
      const characters = Array.from(line);
      items.push(
        characters.length > MAX_LENGTH
          ? `${characters
              .slice(0, MAX_LENGTH - 1)
              .join("")
              .trimEnd()}…`
          : line,
      );
    }
  }
  return items;
}
