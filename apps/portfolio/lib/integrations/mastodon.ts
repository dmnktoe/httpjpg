import { stripHtml } from "./html";
import { fetchWithTimeout, readJson } from "./http";

export interface MastodonPost {
  text: string;
  url: string;
  createdAt: string | null;
  hasMedia: boolean;
  isSensitive: boolean;
}

export type MastodonFetchResult =
  | { ok: true; posts: MastodonPost[] }
  | { ok: false; status: number; message: string };

export interface MastodonHandle {
  user: string;
  host: string;
}

interface MastodonAccount {
  id?: string;
}

interface MastodonStatus {
  id?: string;
  url?: string;
  uri?: string;
  content?: string;
  spoiler_text?: string;
  sensitive?: boolean;
  created_at?: string;
  media_attachments?: unknown[];
}

const DEFAULT_LIMIT = 4;

const MASTODON_USER = /^[A-Za-z0-9_]{1,30}$/;
const MASTODON_HOST = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

export function parseMastodonHandle(value: unknown): MastodonHandle | null {
  if (typeof value !== "string") {
    return null;
  }
  const parts = value.trim().replace(/^@/, "").split("@");
  if (parts.length !== 2) {
    return null;
  }

  const [user, host] = parts;
  if (!MASTODON_USER.test(user) || !MASTODON_HOST.test(host) || host.length > 253) {
    return null;
  }

  return { user, host: host.toLowerCase() };
}

export function toPost(status: MastodonStatus): MastodonPost | null {
  const url = status.url ?? status.uri;
  if (!url) {
    return null;
  }

  const spoiler = status.spoiler_text?.trim();
  const text = spoiler ? `CW: ${spoiler}` : stripHtml(status.content ?? "");
  if (!text) {
    return null;
  }

  return {
    text,
    url,
    createdAt: status.created_at ?? null,
    hasMedia: (status.media_attachments?.length ?? 0) > 0,
    isSensitive: Boolean(spoiler) || status.sensitive === true,
  };
}

export async function fetchMastodonPosts(
  handle: MastodonHandle,
  limit = DEFAULT_LIMIT,
): Promise<MastodonFetchResult> {
  const base = `https://${handle.host}/api/v1`;
  const hint = "Check the Mastodon handle and that the account is public.";

  const lookup = await fetchWithTimeout(
    `${base}/accounts/lookup?acct=${encodeURIComponent(handle.user)}`,
    { label: "Mastodon", hint, headers: { Accept: "application/json" } },
  );
  if (!lookup.ok) {
    return lookup;
  }

  const account = await readJson<MastodonAccount>(lookup.response, "Mastodon");
  if (!account.ok) {
    return account;
  }
  if (!account.data?.id) {
    return { ok: false, status: 502, message: "Unexpected response from the Mastodon API." };
  }

  const statuses = await fetchWithTimeout(
    `${base}/accounts/${encodeURIComponent(account.data.id)}/statuses` +
      `?limit=${Math.max(1, limit)}&exclude_replies=true&exclude_reblogs=true`,
    { label: "Mastodon", hint, headers: { Accept: "application/json" } },
  );
  if (!statuses.ok) {
    return statuses;
  }

  const body = await readJson<MastodonStatus[]>(statuses.response, "Mastodon");
  if (!body.ok) {
    return body;
  }
  if (!Array.isArray(body.data)) {
    return { ok: false, status: 502, message: "Unexpected response from the Mastodon API." };
  }

  const posts = body.data
    .map(toPost)
    .filter((post): post is MastodonPost => post !== null)
    .slice(0, limit);

  return { ok: true, posts };
}
