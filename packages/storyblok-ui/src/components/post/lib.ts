const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const RELATIVE_DAYS = 5;

interface FeedOrigin {
  path: string;
  historyLength: number;
}

let origin: FeedOrigin | null = null;

export function postDay(date: string | undefined): string | undefined {
  return date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
}

export function parsePostDate(date: string | undefined): Date | null {
  const match = date?.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/);
  if (!match) {
    return null;
  }
  const parsed = new Date(`${match[1]}T${match[2] ?? "00:00"}:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function relativePostDate(date: Date, now: number): string | null {
  const elapsed = now - date.getTime();
  if (elapsed < 0 || elapsed >= RELATIVE_DAYS * DAY_MS) {
    return null;
  }
  const minutes = Math.floor(elapsed / MINUTE_MS);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function rememberFeedOrigin(path: string, historyLength: number): void {
  origin = { path, historyLength };
}

export function takeFeedOrigin(path: string, historyLength: number): boolean {
  const remembered = origin;
  origin = null;
  return remembered?.path === path && remembered.historyLength + 1 === historyLength;
}

interface ClickModifiers {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export function isPlainClick(event: ClickModifiers): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
