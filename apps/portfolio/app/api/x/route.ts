import { env } from "@httpjpg/env";

import { CONFIG_FIELDS, requireConfigField } from "@/lib/api/config-field";
import { API_ERROR, jsonError, jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchXTimeline, isXUsername } from "@/lib/integrations/x-posts";

export const GET = publicGet("x", async ({ isDraft }) => {
  const apiKey = env.TWEETAPI_KEY;
  if (!apiKey) {
    return jsonError(API_ERROR.notConfigured, 501, { message: "Set TWEETAPI_KEY" });
  }

  const config = await requireConfigField(CONFIG_FIELDS.xUsername, isXUsername, isDraft);
  if (!config.ok) {
    return config.response;
  }

  const result = await fetchXTimeline({
    apiUrl: env.TWEETAPI_API_URL,
    apiKey,
    username: config.value,
  });

  if (!result.ok) {
    console.warn(`TweetAPI error: ${result.status} - ${result.message}`);
    return jsonUpstream(result.message, result.status);
  }

  return jsonOk(result.timeline, { cache: { isDraft, maxAge: 3600 } });
});
