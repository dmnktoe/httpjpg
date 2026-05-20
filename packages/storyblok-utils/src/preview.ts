/**
 * Validate a Storyblok Visual Editor preview-token URL.
 *
 * Token shape: `SHA1(spaceId:previewToken:timestamp)`. Tokens older than
 * `maxAgeSec` are rejected (default 1h). Pure function — safe in middleware
 * and route handlers.
 */
export async function validateStoryblokPreviewToken(
  searchParams: URLSearchParams,
  previewToken: string | undefined,
  maxAgeSec = 3600,
): Promise<boolean> {
  const spaceId = searchParams.get("_storyblok_tk[space_id]");
  const timestamp = searchParams.get("_storyblok_tk[timestamp]");
  const token = searchParams.get("_storyblok_tk[token]");
  if (!previewToken || !spaceId || !timestamp || !token) {
    return false;
  }
  const t = Number.parseInt(timestamp, 10);
  if (Number.isNaN(t) || Date.now() / 1000 - t > maxAgeSec) {
    return false;
  }
  return token === (await sha1(`${spaceId}:${previewToken}:${timestamp}`));
}

async function sha1(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
