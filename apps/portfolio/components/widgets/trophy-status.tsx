"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

interface TrophyData {
  trophies: PsnTrophy[];
  avatar: string | null;
}

const ITEM_HEIGHT = 20;
const SECONDS_PER_ITEM = 3;

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

  const trophies = data?.trophies ?? [];

  if (trophies.length === 0) {
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

  return (
    <Box
      as="a"
      href={trophies[0].url}
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
      <TrophyTicker trophies={trophies} />
    </Box>
  );
}

function TrophyTicker({ trophies }: { trophies: PsnTrophy[] }) {
  const animated = trophies.length > 1;
  const items = animated ? [...trophies, trophies[0]] : trophies;
  const animationName = `psn-vticker-${trophies.length}`;

  return (
    <Box css={{ flex: 1, minWidth: 0, overflow: "hidden" }} style={{ height: `${ITEM_HEIGHT}px` }}>
      {animated && (
        <style>{`
          @keyframes ${animationName} {
            from { transform: translateY(0); }
            to { transform: translateY(-${trophies.length * ITEM_HEIGHT}px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .${animationName} { animation: none !important; }
          }
        `}</style>
      )}
      <Box
        className={animationName}
        style={
          animated
            ? {
                animation: `${animationName} ${trophies.length * SECONDS_PER_ITEM}s steps(${trophies.length}) infinite`,
              }
            : undefined
        }
      >
        {items.map((trophy, index) => (
          <TrophyTickerItem key={index} trophy={trophy} />
        ))}
      </Box>
    </Box>
  );
}

function TrophyTickerItem({ trophy }: { trophy: PsnTrophy }) {
  return (
    <Box
      css={{ display: "flex", alignItems: "center", gap: 1.5, whiteSpace: "nowrap" }}
      style={{ height: `${ITEM_HEIGHT}px` }}
    >
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
          maxWidth: "180px",
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
          maxWidth: "140px",
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
