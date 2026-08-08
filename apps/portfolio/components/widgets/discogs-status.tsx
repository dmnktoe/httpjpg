"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { DiscogsRelease } from "@/lib/integrations/discogs";

export function DiscogsStatus() {
  const [release, setRelease] = useState<DiscogsRelease | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch("/api/discogs");
        if (response.ok) {
          const data = await response.json();
          setRelease(data.releases?.[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch Discogs collection:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchCollection();
  }, []);

  if (!release) {
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
          discogs:
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
      href={release.url}
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
      <Box as="span" css={{ opacity: 60 }}>
        discogs:
      </Box>
      {release.thumb && (
        <Box
          as="span"
          css={{
            display: "inline-block",
            width: "3",
            height: "auto",
            verticalAlign: "middle",
            borderRadius: "sm",
            overflow: "hidden",
          }}
        >
          <img
            src={release.thumb}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>
      )}
      <Box
        as="span"
        css={{
          maxWidth: "240px",
          opacity: 70,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {release.artist} — {release.title}
      </Box>
      {release.year && (
        <Box as="span" css={{ opacity: 50 }}>
          {release.year}
        </Box>
      )}
      {release.format && (
        <>
          <Box as="span" css={{ opacity: 40 }}>
            ·
          </Box>
          <Box as="span" css={{ opacity: 50 }}>
            {release.format}
          </Box>
        </>
      )}
    </Box>
  );
}
