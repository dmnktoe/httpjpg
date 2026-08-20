"use client";

import {
  Box,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";
import { token } from "@httpjpg/ui/tokens";

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

export interface DiscordPresence {
  status?: DiscordStatusValue;
  activity?: string | null;
  activityDetails?: { playtime?: string | null; icon?: string | null };
}

export interface DiscordStatusProps {
  presence: DiscordPresence | null;
  /** False while the first request is in flight; the line must not claim "offline" yet. */
  loaded: boolean;
}

export function DiscordStatus({ presence, loaded }: DiscordStatusProps) {
  if (!loaded) {
    return <FooterStatusLine label="discord" loading />;
  }

  const status = presence?.status ?? STATUS.offline;
  const activity = presence?.activity || null;
  const playtime = presence?.activityDetails?.playtime || null;
  const activityIcon = presence?.activityDetails?.icon || null;

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
