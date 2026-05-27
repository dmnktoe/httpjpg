import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (!secret) {
    return NextResponse.json({ message: "Missing secret parameter" }, { status: 400 });
  }
  if (secret !== env.STORYBLOK_PREVIEW_SECRET) {
    captureServerException(new Error("Draft mode attempt with invalid secret"), {
      extra: { slug },
    });
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  let redirectPath = "/";
  if (slug && slug !== "{SLUG}") {
    const normalized = slug.replace(/^\/+/, "");
    if (normalized && normalized !== "home") {
      redirectPath = `/${normalized}`;
    }
  }

  const draft = await draftMode();
  draft.enable();

  // Forward `_storyblok*` params — the bridge keys off them on the page URL.
  const redirectUrl = new URL(redirectPath, request.nextUrl.origin);
  for (const [key, value] of searchParams.entries()) {
    if (key === "secret" || key === "slug") {
      continue;
    }
    redirectUrl.searchParams.append(key, value);
  }
  redirectUrl.searchParams.set("_draft", "1");

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  return response;
}
