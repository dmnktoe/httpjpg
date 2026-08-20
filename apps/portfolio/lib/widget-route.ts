import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { widgetCacheHeaders } from "./cache-headers";
import { getConfig } from "./queries/config";
import { enforceRateLimit } from "./rate-limit";

/**
 * Outcome of reading one widget's setting out of the Storyblok config story.
 *
 * `missing` and `unavailable` are deliberately separate: a field the editor has
 * not filled in is a 501 (the widget is off), while a config story we could not
 * read at all is a 503 (the widget is on, the CMS is down).
 */
export type WidgetSetting =
  | { status: "ok"; value: string }
  | { status: "missing" }
  | { status: "unavailable" };

export interface WidgetSettingOptions {
  /** Config field holding the setting, e.g. `discogs_username`. */
  field: keyof SbConfigStory;
  /** Rejects values the upstream would choke on (path traversal, injection, …). */
  validate: (value: string) => boolean;
}

/**
 * Reads one widget setting from the cached config story. Goes through
 * `getConfig()` so every route shares the `CACHE_TAGS.CONFIG` entry instead of
 * hitting Storyblok per request.
 */
export async function resolveWidgetSetting({
  field,
  validate,
}: WidgetSettingOptions): Promise<WidgetSetting> {
  const config = await getConfig();
  if (!config) {
    return { status: "unavailable" };
  }

  const value = config[field];
  if (typeof value !== "string" || !value) {
    return { status: "missing" };
  }
  if (!validate(value)) {
    console.warn(`Ignoring malformed ${field} from Storyblok config`);
    return { status: "missing" };
  }

  return { status: "ok", value };
}

/** The setting's value when it is present and valid, `undefined` otherwise. */
export function settingValue(setting: WidgetSetting): string | undefined {
  return setting.status === "ok" ? setting.value : undefined;
}

export interface WidgetPayloadOptions {
  isDraft: boolean;
  /** Edge freshness window in seconds; draft responses stay private. */
  maxAge: number;
}

export function widgetPayload(
  data: unknown,
  { isDraft, maxAge }: WidgetPayloadOptions,
): NextResponse {
  return NextResponse.json(data, { headers: widgetCacheHeaders(isDraft, maxAge) });
}

/** 503 — the config story could not be read, so we cannot tell if the widget is on. */
export function widgetConfigUnavailable(): NextResponse {
  return NextResponse.json(
    { error: "Config unavailable", message: "Could not load the Storyblok config story" },
    { status: 503 },
  );
}

/** 501 — the editor has not filled the field in, so the widget stays off. */
export function widgetNotConfigured(label: string, field: string): NextResponse {
  return NextResponse.json(
    { error: `${label} not configured`, message: `Set ${field} in the Storyblok config story` },
    { status: 501 },
  );
}

/** 501 — a server env var the widget needs is not set. */
export function widgetMissingEnv(label: string, variable: string): NextResponse {
  return NextResponse.json(
    { error: `${label} not configured`, message: `Set ${variable} to enable this widget` },
    { status: 501 },
  );
}

/** Propagates an upstream failure's status so the client can tell 404 from 504. */
export function widgetUpstreamError(
  label: string,
  failure: { status: number; message: string },
): NextResponse {
  console.warn(`${label} error: ${failure.status} - ${failure.message}`);
  return NextResponse.json(
    { error: `${label} unavailable`, message: failure.message },
    { status: failure.status },
  );
}

export interface WidgetRouteContext {
  /** Draft mode is on, so the response must not be cached publicly. */
  isDraft: boolean;
}

export interface WidgetRouteOptions {
  /** Sentry tag and log prefix, e.g. `discogs`. */
  route: string;
  /** Human label for the fallback 500 body, e.g. `Discogs collection`. */
  label: string;
}

/**
 * Wraps a widget handler in the scaffolding every one of them needs: the shared
 * rate limiter, the request's draft mode, and a last-resort 500 that reports to
 * Sentry. Handlers return their own success and expected-failure responses.
 *
 * Rate limiting lives here rather than in each handler so a new widget route
 * cannot ship without it.
 */
export function widgetRoute(
  { route, label }: WidgetRouteOptions,
  handler: (context: WidgetRouteContext) => Promise<NextResponse>,
): (request: NextRequest) => Promise<NextResponse> {
  return async function handleWidgetRequest(request: NextRequest): Promise<NextResponse> {
    const limited = await enforceRateLimit(request);
    if (limited) {
      return limited;
    }

    const { isEnabled: isDraft } = await draftMode();

    try {
      return await handler({ isDraft });
    } catch (error) {
      console.error(`${route} API error:`, error);
      captureServerException(error, { tags: { route } });
      return NextResponse.json({ error: `Failed to fetch ${label}` }, { status: 500 });
    }
  };
}
