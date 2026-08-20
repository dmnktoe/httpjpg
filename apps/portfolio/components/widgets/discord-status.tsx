"use client";

import {
  Box,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";
import { token } from "@httpjpg/ui/tokens";

import { useWidgetData } from "@/lib/use-widget-data";

const STATUS = { online: "online", idle: "idle", dnd: "dnd", offline: "offline" } as const;
type DiscordStatusValue = (typeof STATUS)[keyof typeof STATUS];

const STATUS_COLORS: Record<DiscordStatusValue, string> = {
  online: token.var("colors.success.500"),
  idle: token.var("colors.warning.500"),
  dnd: token.var("colors.danger.500"),
  offline: token.var("colors.neutral.500"),
};

const STATUS_EMOJI: Record<DiscordStatusValue, string> = {
  online: "🟢",
  idle: "🟡",
  dnd: "🔴",
  offline: "⚫",
};

interface DiscordPresence {
  status?: DiscordStatusValue;
  activity?: string | null;
  activityDetails?: { playtime?: string | null; icon?: string | null };
}

/** Presence changes minute to minute, so this is the one status line that polls. */
const POLL_MS = 30_000;

export function DiscordStatus() {
  const { data, loaded } = useWidgetData<DiscordPresence>("/api/discord", { pollMs: POLL_MS });

  if (!loaded) {
    return <FooterStatusLine label="discord" loading />;
  }

  const status = data?.status ?? STATUS.offline;
  const activity = data?.activity || null;
  const playtime = data?.activityDetails?.playtime || null;
  const activityIcon = data?.activityDetails?.icon || null;

  return (
    <FooterStatusLine label="discord">
      <Box as="span" aria-hidden="true">
        {STATUS_EMOJI[status]}
      </Box>
      <Box as="span" css={{ flexShrink: 0 }} style={{ color: STATUS_COLORS[status] }}>
        {status}
      </Box>
      {activity && (
        <>
          <FooterStatusLineSeparator />
          {activityIcon && <FooterStatusLineThumb src={activityIcon} />}
          <FooterStatusLineText>{activity}</FooterStatusLineText>
          {playtime && (
            <>
              <FooterStatusLineSeparator />
              <FooterStatusLineText fixed dim>
                {playtime}
              </FooterStatusLineText>
            </>
          )}
        </>
      )}
    </FooterStatusLine>
  );
}
