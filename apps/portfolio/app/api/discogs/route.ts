import { CONFIG_FIELDS, requireConfigField } from "@/lib/api/config-field";
import { jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchDiscogsCollection, isDiscogsUsername } from "@/lib/integrations/discogs";

export const GET = publicGet("discogs", async ({ isDraft }) => {
  const config = await requireConfigField(
    CONFIG_FIELDS.discogsUsername,
    isDiscogsUsername,
    isDraft,
  );
  if (!config.ok) {
    return config.response;
  }

  const result = await fetchDiscogsCollection(config.value);
  if (!result.ok) {
    console.warn(`Discogs API error: ${result.status} - ${result.message}`);
    return jsonUpstream(result.message, result.status);
  }

  return jsonOk({ releases: result.releases }, { cache: { isDraft, maxAge: 900 } });
});
