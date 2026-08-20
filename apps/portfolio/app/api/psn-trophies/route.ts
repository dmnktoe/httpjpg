import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextResponse } from "next/server";

import { fetchRecentTrophies, isPsnUsername } from "@/lib/integrations/psn-trophies";
import {
  resolveWidgetSetting,
  settingValue,
  widgetMissingEnv,
  widgetPayload,
  widgetRoute,
} from "@/lib/widget-route";

export const GET = widgetRoute(
  { route: "psn-trophies", label: "PSN trophies" },
  async ({ isDraft }) => {
    if (!env.PSN_NPSSO) {
      return widgetMissingEnv("PSN", "PSN_NPSSO");
    }

    // The username only narrows the lookup, so an unset or unreadable config
    // still yields trophies for the account behind PSN_NPSSO.
    const username = await resolveWidgetSetting({
      field: "psn_username",
      validate: isPsnUsername,
    });

    const result = await fetchRecentTrophies(env.PSN_NPSSO, settingValue(username));
    if (!result.ok) {
      // PSN fails in ways worth telling apart, so this route reports its own
      // reason instead of the shared upstream shape.
      if (result.reportable) {
        console.warn(`PSN trophy fetch failed (${result.reason}): ${result.message}`, result.error);
        captureServerException(result.error, {
          tags: { route: "psn-trophies", reason: result.reason },
        });
      }
      return NextResponse.json(
        { error: "PSN trophies unavailable", reason: result.reason },
        { status: result.status },
      );
    }

    return widgetPayload(
      { trophies: result.trophies, avatar: result.avatar },
      { isDraft, maxAge: 300 },
    );
  },
);
