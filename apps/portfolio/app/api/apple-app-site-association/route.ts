import { env } from "@httpjpg/env";
import { NextResponse } from "next/server";

import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export function GET() {
  if (!env.APPLE_TEAM_ID) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${env.APPLE_TEAM_ID}.${config.ios.bundleId}`],
            components: [{ "/": "/work/*" }, { "/": "/*", exclude: true }],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
