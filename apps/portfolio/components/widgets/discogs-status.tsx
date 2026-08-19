"use client";

import { Box } from "@httpjpg/ui";

import { discogsResponseSchema } from "@/lib/api/schemas";
import { useWidgetQuery } from "@/lib/api/use-widget-query";

export function DiscogsStatus() {
  const { data, loaded } = useWidgetQuery({
    endpoint: "/api/discogs",
    schema: discogsResponseSchema,
    label: "Discogs collection",
  });
  const release = data?.releases[0] ?? null;

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
        discogs:
      </Box>
      {release.thumb && (
        <Box
          as="span"
          css={{
            display: "inline-block",
            flexShrink: 0,
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
          minWidth: "0",
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
        <Box as="span" css={{ flexShrink: 0, opacity: 50 }}>
          {release.year}
        </Box>
      )}
      {release.format && (
        <>
          <Box as="span" css={{ flexShrink: 0, opacity: 40 }}>
            ·
          </Box>
          <Box as="span" css={{ flexShrink: 0, opacity: 50, whiteSpace: "nowrap" }}>
            {release.format}
          </Box>
        </>
      )}
    </Box>
  );
}
