"use client";

import { Box } from "@httpjpg/ui";
import { token } from "@httpjpg/ui/tokens";

import { discordPresenceSchema } from "@/lib/api/schemas";
import { useWidgetQuery } from "@/lib/api/use-widget-query";

const STATUS_COLORS = {
  online: token.var("colors.success.500"),
  idle: token.var("colors.warning.500"),
  dnd: token.var("colors.danger.500"),
  offline: token.var("colors.neutral.500"),
};

const STATUS_EMOJI = {
  online: "🟢",
  idle: "🟡",
  dnd: "🔴",
  offline: "⚫",
};

export function DiscordStatus() {
  const { data } = useWidgetQuery({
    endpoint: "/api/discord",
    schema: discordPresenceSchema,
    label: "Discord status",
    intervalMs: 30_000,
  });

  const status = data?.status ?? "offline";
  const activity = data?.activity ?? null;
  const playtime = data?.activityDetails?.type === "game" ? data.activityDetails.playtime : null;
  const activityIcon = data?.activityDetails?.type === "game" ? data.activityDetails.icon : null;

  return (
    <Box
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        discord:
      </Box>
      <Box as="span">{STATUS_EMOJI[status]}</Box>
      <Box as="span" style={{ color: STATUS_COLORS[status] }}>
        {status}
      </Box>
      {activity && (
        <>
          <Box as="span" css={{ opacity: 50 }}>
            ·
          </Box>
          {activityIcon && (
            <Box
              as="span"
              css={{
                display: "inline-block",
                width: "3",
                height: "3",
                marginRight: "1",
                verticalAlign: "middle",
                borderRadius: "sm",
                overflow: "hidden",
              }}
            >
              <img
                src={activityIcon}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          )}
          <Box
            as="span"
            css={{
              maxWidth: "200px",
              opacity: 70,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {activity}
          </Box>
          {playtime && (
            <>
              <Box as="span" css={{ opacity: 50 }}>
                ·
              </Box>
              <Box as="span" css={{ opacity: 60 }}>
                {playtime}
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
}
