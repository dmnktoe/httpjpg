"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

/**
 * Discord Status Widget
 * Shows live Discord online status via Lanyard API
 */
export const DiscordStatus = () => {
  const [status, setStatus] = useState<"online" | "idle" | "dnd" | "offline">(
    "offline",
  );
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
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    online: "#22C55E",
    idle: "#F59E0B",
    dnd: "#EF4444",
    offline: "#737373",
  };

  const statusEmoji = {
    online: "🟢",
    idle: "🟡",
    dnd: "🔴",
    offline: "⚫",
  };

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
      <Box as="span">{statusEmoji[status]}</Box>
      <Box as="span" style={{ color: statusColors[status] }}>
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
                width: "12px",
                height: "12px",
                verticalAlign: "middle",
                marginRight: "4px",
                borderRadius: "2px",
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
