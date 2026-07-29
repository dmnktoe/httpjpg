import { env } from "@httpjpg/env";
import { NextResponse } from "next/server";

import { config } from "@/lib/config";

/**
 * Serves the Apple App Site Association file that authorises the iOS app
 * (dmnktoe/httpjpg-ios) to open `httpjpg.com` links directly.
 *
 * A route handler rather than a static file in `public/`, because the app id
 * is half configuration: the bundle id is ours to hardcode, the Apple team id
 * is not — it differs per developer account, and baking it in would make every
 * fork of this site claim our app. `next.config.ts` rewrites the well-known
 * path here; the middleware never sees the request, since its matcher skips
 * any path containing a dot.
 */
/**
 * Read the team id per request, not at build time. Statically optimised, this
 * handler would bake in whatever `APPLE_TEAM_ID` was set during the build —
 * so adding the variable later would appear to do nothing until someone
 * redeployed. Apple fetches this file rarely enough that the cost is nil.
 */
export const dynamic = "force-dynamic";

export function GET() {
  // No team id, no claim. Serving the file with a placeholder would be worse
  // than serving nothing: Apple's CDN caches AASA responses for hours, so a
  // wrong one outlives the deploy that fixed it.
  if (!env.APPLE_TEAM_ID) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${env.APPLE_TEAM_ID}.${config.ios.bundleId}`],
            components: [
              { "/": "/work/*", comment: "Work stories open in the iOS app" },
              {
                "/": "/*",
                exclude: true,
                comment: "Everything else stays in the browser until the app handles more",
              },
            ],
          },
        ],
      },
    },
    {
      headers: {
        // Apple requests this without an extension and expects JSON.
        "Content-Type": "application/json",
        // Apple caches aggressively on its own; a short TTL here keeps a
        // corrected team id from being stuck behind our CDN as well.
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
