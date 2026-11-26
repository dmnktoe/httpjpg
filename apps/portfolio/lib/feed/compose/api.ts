export interface ComposerPostImage {
  uid: string;
  src: string;
  fit: "cover" | "contain";
  alt: string;
}

export interface ComposerPostMusic {
  source: string;
  src: string;
  title: string;
  artist: string;
}

export interface ComposerPost {
  slug: string;
  url: string;
  caption: string;
  date: string;
  format: string;
  images: ComposerPostImage[];
  music: ComposerPostMusic | null;
}

export interface SignedUpload {
  id: number;
  uploadUrl: string;
  fields: Record<string, string>;
}

export class ComposerApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ComposerApiError";
    this.status = status;
  }
}

export async function hasSession(): Promise<boolean> {
  const response = await fetch("/api/feed/session", { credentials: "same-origin" });
  return response.ok;
}

export async function signIn(token: string): Promise<void> {
  await send("/api/feed/session", "POST", { token });
}

export async function signOut(): Promise<void> {
  await send("/api/feed/session", "DELETE");
}

export async function signUpload(file: {
  filename: string;
  width?: number;
  height?: number;
}): Promise<SignedUpload> {
  return (await send("/api/feed/assets", "POST", file)) as SignedUpload;
}

export async function loadPost(slug: string): Promise<ComposerPost> {
  const body = (await send(`/api/feed/posts/${encodeURIComponent(slug)}`, "GET")) as {
    slug: string;
    url: string;
    content: Record<string, unknown>;
  };
  return toComposerPost(body.slug, body.url, body.content);
}

export async function publishPost(body: Record<string, unknown>): Promise<{ url: string }> {
  return (await send("/api/feed/posts", "POST", body)) as { url: string };
}

export async function updatePost(
  slug: string,
  body: Record<string, unknown>,
): Promise<{ url: string }> {
  return (await send(`/api/feed/posts/${encodeURIComponent(slug)}`, "PATCH", body)) as {
    url: string;
  };
}

export async function deletePost(slug: string): Promise<void> {
  await send(`/api/feed/posts/${encodeURIComponent(slug)}`, "DELETE");
}

export function postSlugOf(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? "";
}

export function toComposerPost(
  fullSlug: string,
  url: string,
  content: Record<string, unknown>,
): ComposerPost {
  const images = Array.isArray(content.images) ? content.images : [];
  const music = Array.isArray(content.music) ? (content.music[0] as Record<string, unknown>) : null;
  return {
    slug: postSlugOf(fullSlug),
    url,
    caption: text(content.caption),
    date: text(content.date),
    format: text(content.format) || "1/1",
    images: images.flatMap((raw) => {
      const blok = raw as Record<string, unknown>;
      const src = text((blok.image as Record<string, unknown> | undefined)?.filename);
      return src && typeof blok._uid === "string"
        ? [
            {
              uid: blok._uid,
              src,
              fit: blok.fit === "contain" ? ("contain" as const) : ("cover" as const),
              alt: text(blok.alt),
            },
          ]
        : [];
    }),
    music:
      music && text(music.src)
        ? {
            source: text(music.source) || "mp3",
            src: text(music.src),
            title: text(music.title),
            artist: text(music.artist),
          }
        : null,
  };
}

async function send(url: string, method: string, body?: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    ...(body === undefined
      ? {}
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new ComposerApiError(
      response.status,
      payload?.message ?? `Request failed (${response.status})`,
    );
  }
  return payload;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
