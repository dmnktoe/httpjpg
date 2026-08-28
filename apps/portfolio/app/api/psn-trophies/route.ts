import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { API_ERROR, jsonError } from "@/lib/api-error";
import { fetchRecentTrophies, isPsnUsername } from "@/lib/integrations/psn-trophies";
import { WIDGET_MAX_AGE } from "@/lib/queries/widget-status";
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
      // PSN fails in ways worth telling apart, so the upstream error carries
      // the reason alongside the shared code.
      if (result.reportable) {
        console.warn(`PSN trophy fetch failed (${result.reason}): ${result.message}`, result.error);
        captureServerException(result.error, {
          tags: { route: "psn-trophies", reason: result.reason },
        });
      }
      return jsonError(API_ERROR.upstream, result.status, {
        message: "Failed to fetch PSN trophies",
        reason: result.reason,
      });
    }

    return widgetPayload(
      { trophies: result.trophies, avatar: result.avatar },
      { isDraft, maxAge: WIDGET_MAX_AGE.psnTrophies },
    );
  },
);
