import { CONFIG_FIELDS, requireConfigField } from "@/lib/api/config-field";
import { jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchLetterboxdFilms, isLetterboxdUsername } from "@/lib/integrations/letterboxd";

export const GET = publicGet("letterboxd", async ({ isDraft }) => {
  const config = await requireConfigField(
    CONFIG_FIELDS.letterboxdUsername,
    isLetterboxdUsername,
    isDraft,
  );
  if (!config.ok) {
    return config.response;
  }

  const result = await fetchLetterboxdFilms(config.value);
  if (!result.ok) {
    console.warn(`Letterboxd RSS error: ${result.status} - ${result.message}`);
    return jsonUpstream(result.message, result.status);
  }

  return jsonOk({ films: result.films }, { cache: { isDraft, maxAge: 300 } });
});
