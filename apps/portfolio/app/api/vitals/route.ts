import { captureWebVital, type WebVitalName, type WebVitalRating } from "@httpjpg/observability";
import { type NextRequest, NextResponse } from "next/server";

const VITAL_NAMES: readonly WebVitalName[] = ["CLS", "FCP", "LCP", "TTFB", "INP"];
const RATINGS: readonly WebVitalRating[] = ["good", "needs-improvement", "poor"];

interface IncomingPayload {
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  id?: unknown;
  pathname?: unknown;
  navigationType?: unknown;
}

function isVitalName(value: unknown): value is WebVitalName {
  return typeof value === "string" && (VITAL_NAMES as readonly string[]).includes(value);
}

function isRating(value: unknown): value is WebVitalRating {
  return typeof value === "string" && (RATINGS as readonly string[]).includes(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asCappedString(value: unknown, maxLength: number): string | undefined {
  const normalized = asString(value);
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

const MAX_BODY_BYTES = 4096;
const MAX_PATHNAME_LENGTH = 500;

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: IncomingPayload;
  try {
    body = JSON.parse(rawBody) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isVitalName(body.name) || typeof body.value !== "number" || !Number.isFinite(body.value)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  captureWebVital({
    name: body.name,
    value: body.value,
    rating: isRating(body.rating) ? body.rating : undefined,
    id: asString(body.id),
    pathname: asCappedString(body.pathname, MAX_PATHNAME_LENGTH),
    navigationType: asString(body.navigationType),
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
