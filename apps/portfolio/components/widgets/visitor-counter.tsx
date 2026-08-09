"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

export function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/umami");
        if (response.ok) {
          const data = await response.json();
          if (typeof data?.visitors === "number" && typeof data?.pageviews === "number") {
            setStats({ visitors: data.visitors, pageviews: data.pageviews });
          }
        }
      } catch (error) {
        console.error("Failed to fetch visitor stats:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
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
          visitors:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
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
        visitors:
      </Box>
      <Box
        as="span"
        aria-label={`${stats.visitors} visitors`}
        css={{
          px: 1,
          opacity: 70,
          letterSpacing: "0.15em",
          border: "1px solid",
          borderColor: "pageBorder",
          borderRadius: "sm",
        }}
      >
        {padCount(stats.visitors)}
      </Box>
      <Box as="span" css={{ opacity: 50 }}>
        ·
      </Box>
      <Box as="span" css={{ opacity: 50 }}>
        {stats.pageviews.toLocaleString("en-US")} views
      </Box>
    </Box>
  );
}

function padCount(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return safe.toString().padStart(COUNTER_DIGITS, "0");
}

const COUNTER_DIGITS = 6;

interface VisitorStats {
  pageviews: number;
  visitors: number;
}
