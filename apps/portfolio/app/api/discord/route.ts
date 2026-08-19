import { CONFIG_FIELDS, requireConfigField } from "@/lib/api/config-field";
import { jsonUpstream } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { fetchDiscordPresence, isDiscordUserId } from "@/lib/integrations/discord";

export const GET = publicGet("discord", async ({ isDraft }) => {
  const config = await requireConfigField(CONFIG_FIELDS.discordUserId, isDiscordUserId, isDraft);
  if (!config.ok) {
    return config.response;
  }

  const result = await fetchDiscordPresence(config.value);
  if (!result.ok) {
    console.warn(`Lanyard API error: ${result.status} - User may need to join Lanyard bot`);
    return jsonUpstream(result.message, result.status);
  }

  return jsonOk(result.presence, { cache: { isDraft, maxAge: 30 } });
});
