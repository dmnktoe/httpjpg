import { lookup } from "node:dns/promises";

export interface FaviconAsset {
  ok: true;
  body: Uint8Array<ArrayBuffer>;
  contentType: string;
  source: string;
}

export type FaviconResult = FaviconAsset | { ok: false; status: number; message: string };

interface IconCandidate {
  href: string;
  rel: string;
  sizes: string;
}

const FAVICON_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 256 * 1024;
const MAX_ICON_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const MAX_CANDIDATES = 6;

const USER_AGENT = "Mozilla/5.0 (compatible; httpjpg-favicon/1.0; +https://httpjpg.com)";

const ICON_REL_TOKENS = ["icon", "apple-touch-icon", "apple-touch-icon-precomposed"];

const REL_BLOCKLIST = ["mask-icon", "fluid-icon"];

const MAGIC_CONTENT_TYPES: { type: string; match: (bytes: Uint8Array) => boolean }[] = [
  {
    type: "image/png",
    match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    type: "image/x-icon",
    match: (b) =>
      b[0] === 0x00 && b[1] === 0x00 && (b[2] === 0x01 || b[2] === 0x02) && b[3] === 0x00,
  },
  {
    type: "image/gif",
    match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
  { type: "image/jpeg", match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/bmp", match: (b) => b[0] === 0x42 && b[1] === 0x4d },
  {
    type: "image/webp",
    match: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45,
  },
];

export function isHttpUrl(value: string): URL | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }
  if (url.username || url.password) {
    return null;
  }
  return url;
}

export function isPrivateAddress(address: string): boolean {
  const ip = address.startsWith("::ffff:") ? address.slice(7) : address;

  if (ip.includes(".")) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
      return true;
    }
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && (b === 168 || b === 0)) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }

  const ipv6 = ip.toLowerCase();
  if (ipv6 === "::" || ipv6 === "::1") return true;
  if (ipv6.startsWith("fc") || ipv6.startsWith("fd")) return true;
  if (
    ipv6.startsWith("fe8") ||
    ipv6.startsWith("fe9") ||
    ipv6.startsWith("fea") ||
    ipv6.startsWith("feb")
  ) {
    return true;
  }
  return false;
}

async function isPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return false;
  }
  try {
    const addresses = await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
}

async function safeFetch(target: URL, accept: string): Promise<Response | null> {
  let url = target;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await isPublicHost(url.hostname))) {
      return null;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(FAVICON_TIMEOUT_MS),
        headers: { Accept: accept, "User-Agent": USER_AGENT },
      });
    } catch {
      return null;
    }

    if (response.status < 300 || response.status > 399) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return response;
    }
    const next = isHttpUrl(new URL(location, url).href);
    if (!next) {
      return null;
    }
    url = next;
  }

  return null;
}

async function readLimited(
  response: Response,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const declared = Number(response.headers.get("content-length"));
  if (!Number.isNaN(declared) && declared > maxBytes) {
    return null;
  }

  const body = new Uint8Array(await response.arrayBuffer());
  return body.byteLength > maxBytes ? null : body;
}

export function sniffContentType(bytes: Uint8Array): string | null {
  if (bytes.byteLength < 4) {
    return null;
  }

  for (const { type, match } of MAGIC_CONTENT_TYPES) {
    if (match(bytes)) {
      return type;
    }
  }

  const head = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "image/svg+xml";
  }
  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2f;/gi, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function readAttribute(tag: string, name: string): string {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'\`=<>]+))`, "i"),
  );
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function isIconRel(rel: string): boolean {
  const tokens = rel.split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || tokens.some((token) => REL_BLOCKLIST.includes(token))) {
    return false;
  }
  return tokens.some((token) => ICON_REL_TOKENS.includes(token));
}

export function extractIconCandidates(html: string): IconCandidate[] {
  const head = html.split(/<\/head>/i)[0];
  const candidates: IconCandidate[] = [];

  for (const tag of head.match(/<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) ?? []) {
    const rel = readAttribute(tag, "rel").toLowerCase();
    const href = readAttribute(tag, "href");
    if (!href || !isIconRel(rel)) {
      continue;
    }
    candidates.push({
      href: decodeHtmlEntities(href),
      rel,
      sizes: readAttribute(tag, "sizes").toLowerCase(),
    });
  }

  return candidates;
}

function parseSize(sizes: string): number {
  if (sizes === "any") {
    return Number.MAX_SAFE_INTEGER;
  }
  const parsed = sizes
    .split(/\s+/)
    .map((entry) => Number.parseInt(entry.split("x")[0], 10))
    .filter((value) => !Number.isNaN(value));
  return parsed.length > 0 ? Math.max(...parsed) : 0;
}

function rankCandidates(candidates: IconCandidate[], size: number): IconCandidate[] {
  return [...candidates].sort((a, b) => {
    const aSize = parseSize(a.sizes);
    const bSize = parseSize(b.sizes);
    const aCovers = aSize >= size;
    const bCovers = bSize >= size;
    if (aCovers !== bCovers) {
      return aCovers ? -1 : 1;
    }
    if (aSize !== bSize) {
      return aCovers ? aSize - bSize : bSize - aSize;
    }
    const aTouch = a.rel.startsWith("apple-touch-icon");
    const bTouch = b.rel.startsWith("apple-touch-icon");
    return aTouch === bTouch ? 0 : aTouch ? 1 : -1;
  });
}

export function fallbackIconUrls(pageUrl: URL): string[] {
  const urls = [new URL("/favicon.ico", pageUrl).href];
  const directory = pageUrl.pathname.replace(/[^/]*$/, "");
  if (directory && directory !== "/") {
    urls.unshift(new URL(`${directory}favicon.ico`, pageUrl).href);
  }
  return urls;
}

function decodeDataUrl(href: string): FaviconAsset | null {
  const match = href.match(/^data:([^;,]+)?(;base64)?,(.*)$/i);
  if (!match) {
    return null;
  }
  const [, declaredType, base64, data] = match;
  try {
    const bytes = base64
      ? Uint8Array.from(Buffer.from(data, "base64"))
      : new TextEncoder().encode(decodeURIComponent(data));
    const contentType = sniffContentType(bytes) ?? declaredType;
    if (!contentType?.startsWith("image/")) {
      return null;
    }
    return { ok: true, body: bytes, contentType, source: "data:" };
  } catch {
    return null;
  }
}

async function fetchIcon(iconUrl: string): Promise<FaviconAsset | null> {
  if (iconUrl.startsWith("data:")) {
    return decodeDataUrl(iconUrl);
  }

  const url = isHttpUrl(iconUrl);
  if (!url) {
    return null;
  }

  const response = await safeFetch(url, "image/*,*/*;q=0.8");
  if (!response?.ok) {
    return null;
  }

  const body = await readLimited(response, MAX_ICON_BYTES);
  if (!body) {
    return null;
  }

  const contentType = sniffContentType(body);
  if (!contentType) {
    return null;
  }

  return { ok: true, body, contentType, source: url.href };
}

async function readHtmlHead(response: Response): Promise<string | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    const bytes = await readLimited(response, MAX_HTML_BYTES);
    return bytes ? new TextDecoder().decode(bytes) : null;
  }

  const decoder = new TextDecoder();
  let html = "";
  let read = 0;

  try {
    while (read < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      read += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) {
        break;
      }
    }
  } catch {
    return html || null;
  } finally {
    await reader.cancel().catch(() => {});
  }

  return html || null;
}

async function fetchPageIconHrefs(pageUrl: URL, size: number): Promise<string[]> {
  const response = await safeFetch(pageUrl, "text/html,application/xhtml+xml");
  if (!response?.ok) {
    return [];
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && contentType !== "") {
    return [];
  }

  const html = await readHtmlHead(response);
  if (!html) {
    return [];
  }

  const base = isHttpUrl(response.url) ?? pageUrl;

  return rankCandidates(extractIconCandidates(html), size)
    .map((candidate) => {
      if (candidate.href.startsWith("data:")) {
        return candidate.href;
      }
      try {
        return new URL(candidate.href, base).href;
      } catch {
        return null;
      }
    })
    .filter((href): href is string => href !== null);
}

export async function fetchFavicon(rawUrl: string, size = 16): Promise<FaviconResult> {
  const pageUrl = isHttpUrl(rawUrl);
  if (!pageUrl) {
    return { ok: false, status: 400, message: "Unsupported favicon URL." };
  }

  const declared = await fetchPageIconHrefs(pageUrl, size);
  const candidates = [...new Set([...declared, ...fallbackIconUrls(pageUrl)])].slice(
    0,
    MAX_CANDIDATES,
  );

  for (const candidate of candidates) {
    const asset = await fetchIcon(candidate);
    if (asset) {
      return asset;
    }
  }

  return { ok: false, status: 404, message: "No favicon found." };
}
