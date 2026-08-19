import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { CONFIG_FIELDS, resolveConfigField } from "@/lib/api/config-field";
import { API_ERROR, jsonError, jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchRecentTrophies, isPsnUsername } from "@/lib/integrations/psn-trophies";

export const GET = publicGet("psn-trophies", async ({ isDraft }) => {
  if (!env.PSN_NPSSO) {
    return jsonError(API_ERROR.notConfigured, 501, {
      message: "Set PSN_NPSSO to enable the trophy widget",
    });
  }

  const resolved = await resolveConfigField(CONFIG_FIELDS.psnUsername, isPsnUsername, isDraft);
  const username = resolved.ok ? resolved.value : undefined;

  const result = await fetchRecentTrophies(env.PSN_NPSSO, username);
  if (!result.ok) {
    if (result.reportable) {
      console.warn(`PSN trophy fetch failed (${result.reason}): ${result.message}`, result.error);
      captureServerException(result.error, {
        tags: { route: "psn-trophies", reason: result.reason },
      });
    }
    return jsonUpstream(result.message, result.status, { reason: result.reason });
  }

  return jsonOk(
    { trophies: result.trophies, avatar: result.avatar },
    { cache: { isDraft, maxAge: 300 } },
  );
});
