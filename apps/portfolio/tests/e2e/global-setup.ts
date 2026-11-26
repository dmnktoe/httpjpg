import type { FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig): Promise<void> {
  const secret = process.env.STORYBLOK_REVALIDATE_SECRET;
  const baseURL = config.projects[0]?.use.baseURL;
  if (!secret || !baseURL) {
    return;
  }
  const response = await fetch(new URL("/api/revalidate", baseURL), {
    method: "POST",
    headers: { "content-type": "application/json", "webhook-secret": secret },
    body: JSON.stringify({ action: "published", full_slug: "config" }),
  });
  if (!response.ok) {
    throw new Error(`Could not expire the build's CMS caches: HTTP ${response.status}`);
  }
}
