import { fetchWithTimeout, type HttpResult } from "./http";

/** Shared endpoint; participating engines (Bing, Yandex, Seznam, …) forward to each other. */
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Where the key file is served, relative to the site root. */
export const INDEXNOW_KEY_PATH = "/indexnow.txt";

/** Spec limit per request. */
const MAX_URLS = 10_000;

/**
 * Tell IndexNow engines that `urls` changed (published, updated or removed).
 * https://www.indexnow.org/documentation
 */
export async function submitIndexNow({
  baseUrl,
  key,
  urls,
}: {
  baseUrl: string;
  key: string;
  urls: string[];
}): Promise<HttpResult> {
  const origin = new URL(baseUrl);
  return fetchWithTimeout(INDEXNOW_ENDPOINT, {
    label: "IndexNow",
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: origin.host,
      key,
      keyLocation: new URL(INDEXNOW_KEY_PATH, origin).toString(),
      urlList: [...new Set(urls)].slice(0, MAX_URLS),
    }),
    hint: "403 means the key file did not match; 422 means a URL is off-host.",
  });
}
