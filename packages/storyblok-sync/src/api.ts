/**
 * Shared utilities for Storyblok Management API
 */

export const STORYBLOK_API = "https://mapi.storyblok.com/v1";

/**
 * Get environment variables
 */
export function getEnv() {
  return {
    spaceId: process.env.STORYBLOK_SPACE_ID,
    token: process.env.STORYBLOK_MANAGEMENT_TOKEN,
  };
}

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const { token, spaceId } = getEnv();

  if (!token) {
    console.error("❌ Missing STORYBLOK_MANAGEMENT_TOKEN environment variable");
    console.log("\nGet your token from:");
    console.log("https://app.storyblok.com/#!/me/account?tab=token");
    process.exit(1);
  }

  if (!spaceId) {
    console.error("❌ Missing STORYBLOK_SPACE_ID environment variable");
    console.log("\nFind your Space ID in Storyblok Settings → General");
    process.exit(1);
  }
}

/**
 * Make authenticated request to Storyblok Management API
 */
export async function storyblokRequest<T>(
  endpoint: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const { token, spaceId } = getEnv();
  const url = `${STORYBLOK_API}/spaces/${spaceId}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: token!,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storyblok API error (${response.status}): ${error}`);
  }

  // Some endpoints return empty responses (DELETE, some PUTs)
  const text = await response.text();
  if (!text || text.trim() === "") {
    return {} as T;
  }

  return JSON.parse(text);
}
