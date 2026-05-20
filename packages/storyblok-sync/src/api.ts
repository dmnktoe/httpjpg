export const STORYBLOK_API = "https://mapi.storyblok.com/v1";

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

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storyblok API error (${response.status}): ${error}`);
  }

  const text = await response.text();
  return text.trim() === "" ? ({} as T) : JSON.parse(text);
}
