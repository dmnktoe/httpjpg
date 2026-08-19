import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";

import { enforceRateLimit } from "@/lib/rate-limit";

import { API_ERROR, jsonError } from "./errors";

export interface PublicRouteContext {
  request: NextRequest;
  isDraft: boolean;
}

export interface PublicRouteOptions {
  /** Read Storyblok draft mode. Defaults to true for widget BFFs. */
  withDraft?: boolean;
}

type PublicHandler = (ctx: PublicRouteContext) => Promise<Response> | Response;

async function handlePublicRoute(
  route: string,
  handler: PublicHandler,
  request: NextRequest,
  options: PublicRouteOptions,
): Promise<Response> {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  const isDraft = options.withDraft === false ? false : (await draftMode()).isEnabled;

  try {
    return await handler({ request, isDraft });
  } catch (error) {
    console.error(`${route} API error:`, error);
    captureServerException(error, { tags: { route } });
    return jsonError(API_ERROR.internal, 500, { message: "Request failed" });
  }
}

export function publicGet(
  route: string,
  handler: PublicHandler,
  options: PublicRouteOptions = {},
): (request: NextRequest) => Promise<Response> {
  return (request) => handlePublicRoute(route, handler, request, options);
}

export function publicPost(
  route: string,
  handler: PublicHandler,
  options: PublicRouteOptions = {},
): (request: NextRequest) => Promise<Response> {
  return (request) => handlePublicRoute(route, handler, request, options);
}
