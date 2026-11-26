import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Avatar } from "../avatar/avatar";
import { Box } from "../box/box";

export interface FeedProfileStat {
  label: string;
  value: string;
}

export interface FeedProfileProps {
  name: string;
  avatarSrc?: string;
  /** Short counters beside the name, e.g. `{ value: "12", label: "posts" }`. */
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
  return (
    <Box
      css={{
        display: "flex",
        alignItems: "center",
        gap: { base: "5", md: "10" },
        ...cssProp,
      }}
    >
      <Avatar name={name} src={avatarSrc} size="lg" ring css={{ m: "0.375rem" }} />
      <Box css={{ display: "flex", flexDirection: "column", gap: "2", minW: 0 }}>
        <Box as="p" css={{ m: 0, fontSize: "lg", fontWeight: "bold", lineHeight: "tight" }}>
          {name}
        </Box>
        {stats.length > 0 && (
          <Box
            as="dl"
            css={{
              display: "flex",
              flexWrap: "wrap",
              rowGap: "1",
              columnGap: "5",
              m: 0,
              fontFamily: "mono",
              fontSize: "sm",
            }}
          >
            {stats.map((stat) => (
              <Box
                key={stat.label}
                css={{ display: "flex", flexDirection: "row-reverse", gap: "1" }}
              >
                <Box as="dt" css={{ opacity: 0.6 }}>
                  {stat.label}
                </Box>
                <Box as="dd" css={{ m: 0, fontWeight: "bold" }}>
                  {stat.value}
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {children ? <Box css={{ fontSize: "sm", lineHeight: "snug" }}>{children}</Box> : null}
      </Box>
    </Box>
  );
}
