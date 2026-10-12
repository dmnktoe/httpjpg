import { env } from "@httpjpg/env";

/** IndexNow key file: engines fetch it to prove the pings came from this host. */
export function GET() {
  if (!env.INDEXNOW_KEY) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(env.INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
