import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "@/lib/api-error";
import { authorizeFeedRequest } from "@/lib/feed/auth";
import { parseAssetRequest } from "@/lib/feed/publish";
import { mapiConfig, signAssetUpload } from "@/lib/integrations/storyblok-mapi";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const denied = authorizeFeedRequest(request);
  if (denied) {
    return denied;
  }
  const config = mapiConfig();
  if (!config) {
    return jsonError(API_ERROR.notConfigured, 503, {
      message: "Storyblok management access is not configured on this deployment",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(API_ERROR.invalidJson, 400);
  }
  const parsed = parseAssetRequest(body);
  if (!parsed.ok) {
    return jsonError(API_ERROR.invalidBody, 400, { message: parsed.message });
  }

  try {
    const upload = await signAssetUpload(config, parsed.value);
    return NextResponse.json(upload, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Feed asset signing failed:", error);
    captureServerException(error, { tags: { route: "feed-assets" } });
    return jsonError(API_ERROR.upstream, 502, { message: "Storyblok did not sign the upload" });
  }
}
