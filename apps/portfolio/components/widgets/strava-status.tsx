"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import {
  estimateSteps,
  formatDistanceKm,
  isSteppableType,
  type StravaStatusPayload,
} from "@/lib/integrations/strava";

function formatStatus(status: StravaStatusPayload): { label: string; href: string } {
  const href = status.latest?.url ?? status.profileUrl;

  if (status.todayCount > 0) {
    const distance = formatDistanceKm(status.todayDistanceMeters);
    if (isSteppableType(status.primaryType)) {
      const steps = estimateSteps(status.todayDistanceMeters);
      return {
        label: `${steps.toLocaleString("en-US")} steps · ${distance}`,
        href,
      };
    }
    const type = status.primaryType ?? "workout";
    return { label: `${distance} · ${type}`, href };
  }

  if (status.latest) {
    return {
      label: `last · ${status.latest.type} · ${formatDistanceKm(status.latest.distanceMeters)}`,
      href: status.latest.url,
    };
  }

  return { label: "no recent activity", href: status.profileUrl };
}

export function StravaStatus() {
  const [status, setStatus] = useState<StravaStatusPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/strava");
        if (response.ok) {
          setStatus((await response.json()) as StravaStatusPayload);
        }
      } catch (error) {
        console.error("Failed to fetch Strava status:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchStatus();
  }, []);

  if (!status) {
    if (loaded) {
      return null;
    }
    return (
      <Box
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          minHeight: "5",
          opacity: 80,
          fontFamily: "mono",
          fontSize: "xs",
        }}
      >
        <Box as="span" css={{ opacity: 60 }}>
          strava:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

  const { label, href } = formatStatus(status);

  return (
    <Box
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        maxWidth: "full",
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
      }}
    >
      <Box as="span" css={{ flexShrink: 0, opacity: 60 }}>
        strava:
      </Box>
      <Box
        as="span"
        css={{
          minWidth: "0",
          maxWidth: "280px",
          opacity: 70,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}
