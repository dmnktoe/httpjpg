"use client";

import { Box } from "@httpjpg/ui";
import { token } from "@httpjpg/ui/tokens";
import { useEffect, useState } from "react";

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

export const DiscordStatus = () => {
  const [status, setStatus] = useState<"online" | "idle" | "dnd" | "offline">("offline");
  const [activity, setActivity] = useState<string | null>(null);
  const [playtime, setPlaytime] = useState<string | null>(null);
  const [activityIcon, setActivityIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/discord");
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status || "offline");
          setActivity(data.activity || null);
          setPlaytime(data.activityDetails?.playtime || null);
          setActivityIcon(data.activityDetails?.icon || null);
        }
      } catch (error) {
        console.error("Failed to fetch Discord status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      css={{
        fontSize: "xs",
        fontFamily: "mono",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        opacity: 80,
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
                verticalAlign: "middle",
                marginRight: "1",
                borderRadius: "sm",
                overflow: "hidden",
              }}
              data-preview-image={activityIcon}
              data-preview-ratio="1:1"
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
              opacity: 70,
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            data-preview-image={activityIcon || undefined}
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
};
