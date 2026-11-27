import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { FeedProfilePhoto } from "./feed-profile-photo";

export interface FeedProfileStat {
  label: string;
  value: string;
}

export interface FeedProfileProps {
  name: string;
  avatarSrc?: string;
  /** Short counters beside the picture, e.g. `{ value: "12", label: "posts" }`. */
  stats?: FeedProfileStat[];
  /** The line under the name. */
  children?: ReactNode;
  css?: SystemStyleObject;
}

export function FeedProfile({
  name,
  avatarSrc,
  stats = [],
  children,
  css: cssProp,
}: FeedProfileProps) {
  const details = (
    <Box css={{ display: "flex", flexDirection: "column", gap: "1", minW: 0 }}>
      <Box as="p" css={{ m: 0, fontSize: "md", fontWeight: "bold", lineHeight: "tight" }}>
        {name}
      </Box>
      {children ? (
        <Box css={{ color: "neutral.600", fontSize: "sm", lineHeight: "snug" }}>{children}</Box>
      ) : null}
    </Box>
  );

  return (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "center",
        columnGap: { base: "4", md: "6" },
        rowGap: "3",
        ...cssProp,
      }}
    >
      <FeedProfilePhoto name={name} src={avatarSrc} />
      {stats.length > 0 ? (
        <>
          <Box
            as="dl"
            css={{
              display: "flex",
              m: 0,
              bg: "linear-gradient(to bottom, {colors.white} 0%, {colors.neutral.100} 100%)",
              border: "1px solid {colors.neutral.300}",
              borderRadius: "0.5rem",
              boxShadow: "inset 0 1px 0 {colors.white}, 0 1px 1px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            {stats.map((stat) => (
              <Box
                key={stat.label}
                css={{
                  display: "flex",
                  flex: "1 1 0",
                  flexDirection: "column-reverse",
                  alignItems: "center",
                  gap: "0.5",
                  minW: 0,
                  px: "1",
                  py: { base: "2", md: "3" },
                  borderLeft: "1px solid {colors.neutral.300}",
                  _first: { borderLeft: "none" },
                }}
              >
                <Box as="dt" css={{ color: "neutral.500", fontSize: "sm" }}>
                  {stat.label}
                </Box>
                <Box
                  as="dd"
                  css={{
                    m: 0,
                    color: "neutral.900",
                    fontSize: { base: "lg", md: "xl" },
                    fontWeight: "bold",
                    lineHeight: 1,
                    textShadow: "0 1px 0 {colors.white}",
                  }}
                >
                  {stat.value}
                </Box>
              </Box>
            ))}
          </Box>
          <Box css={{ gridColumn: "1 / -1" }}>{details}</Box>
        </>
      ) : (
        details
      )}
    </Box>
  );
}
