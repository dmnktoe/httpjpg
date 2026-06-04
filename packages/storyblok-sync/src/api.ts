export const STORYBLOK_API = "https://mapi.storyblok.com/v1";

/**
 * The Storyblok Management API is capped at 6 requests/second. We serialize
 * requests through a single gate and keep at least this many ms between the
 * start of consecutive requests, leaving headroom under the limit.
 */
const MIN_REQUEST_INTERVAL_MS = 200;

/** How many times to retry a 429 before giving up. */
const MAX_RETRIES = 5;

let requestGate = Promise.resolve();
let lastRequestAt = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Acquire the shared throttle gate, ensuring requests are spaced out by at
 * least `MIN_REQUEST_INTERVAL_MS`. Returns once it's this caller's turn.
 */
function acquireRequestSlot(): Promise<void> {
  const slot = requestGate.then(async () => {
    const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  });
  // Keep the chain alive even if a turn rejects, so the queue never wedges.
  requestGate = slot.catch(() => {});
  return slot;
}

export function getEnv() {
  return {
    spaceId: process.env.STORYBLOK_SPACE_ID,
    token: process.env.STORYBLOK_MANAGEMENT_TOKEN,
  };
}

export function validateEnv(): void {
  const { token, spaceId } = getEnv();
  if (!token) {
    console.error("Missing STORYBLOK_MANAGEMENT_TOKEN env var");
    process.exit(1);
  }
  if (!spaceId) {
    console.error("Missing STORYBLOK_SPACE_ID env var");
    process.exit(1);
  }
}

export async function storyblokRequest<T>(
  endpoint: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const { token, spaceId } = getEnv();
  const url = `${STORYBLOK_API}/spaces/${spaceId}${endpoint}`;

  for (let attempt = 0; ; attempt++) {
    await acquireRequestSlot();

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: token || "",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get("retry-after"));
      // Honour Retry-After when present, otherwise back off exponentially.
      const backoff =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : MIN_REQUEST_INTERVAL_MS * 2 ** attempt;
      console.warn(
        `⏳ Rate limited (429), retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(backoff);
      continue;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Storyblok API error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text.trim() === "" ? ({} as T) : JSON.parse(text);
  }
}
