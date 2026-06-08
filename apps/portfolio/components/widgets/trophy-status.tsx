"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

// The trophy tier maps to a local, pre-pixelated PSN trophy sprite.
function trophyIcon(type: PsnTrophy["type"]): string {
  return `/images/trophies/${type}.png`;
}

export function TrophyStatus() {
  const [trophy, setTrophy] = useState<PsnTrophy | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const response = await fetch("/api/psn-trophies");
        if (response.ok) {
          const data = await response.json();
          setTrophy(data.trophies?.[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch PSN trophies:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchTrophies();
  }, []);

  // Hold the footer line with a loading label while the request is in flight so
  // it doesn't jump when the trophy pops in; collapse only once we know it's empty.
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
        <Box as="span" css={{ opacity: 60 }}>
          trophy:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

  const icon = trophyIcon(trophy.type);

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
        _hover: { opacity: 100 },
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        trophy:
      </Box>
      {trophy.avatar && (
        <Box
          as="span"
          css={{
            display: "inline-block",
            width: "3",
            height: "3",
            verticalAlign: "middle",
            borderRadius: "sm",
            overflow: "hidden",
          }}
        >
          <img
            src={trophy.avatar}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              imageRendering: "pixelated",
            }}
          />
        </Box>
      )}
      <Box
        as="span"
        css={{
          display: "inline-block",
          width: "3.5",
          height: "3.5",
          verticalAlign: "middle",
        }}
      >
        <img
          src={icon}
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
        data-preview-image={icon}
        data-preview-ratio="1:1"
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
      {trophy.platform && (
        <Box as="span" css={{ opacity: 50 }}>
          {trophy.platform}
        </Box>
      )}
    </Box>
  );
}
