"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

interface TrophyData {
  trophies: PsnTrophy[];
  avatar: string | null;
}

export function TrophyStatus() {
  const [data, setData] = useState<TrophyData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const response = await fetch("/api/psn-trophies");
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch PSN trophies:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchTrophies();
  }, []);

  const trophy = data?.trophies?.[0] ?? null;

  if (!trophy) {
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
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

  return (
    <Box
      as="a"
      href={trophy.url}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
      }}
    >
      {data?.avatar && (
        <Box
          as="span"
          css={{
            display: "inline-block",
            flexShrink: 0,
            width: "4",
            height: "4",
            borderRadius: "full",
            overflow: "hidden",
          }}
        >
          <img
            src={data.avatar}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>
      )}
      {trophy.image && (
        <Box as="span" css={{ display: "inline-block", flexShrink: 0, width: "4", height: "4" }}>
          <img
            src={trophy.image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </Box>
      )}
      <Box as="span" css={{ display: "inline-block", flexShrink: 0, width: "3.5", height: "3.5" }}>
        <img
          src={`/images/trophies/${trophy.type}.png`}
          alt={`${trophy.type} trophy`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            imageRendering: "pixelated",
          }}
        />
      </Box>
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
        {trophy.name}
      </Box>
      <Box as="span" css={{ opacity: 50 }}>
        ·
      </Box>
      <Box
        as="span"
        css={{
          maxWidth: "160px",
          opacity: 60,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {trophy.game}
      </Box>
    </Box>
  );
}
