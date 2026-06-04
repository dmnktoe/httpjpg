import { Box, Link } from "@httpjpg/ui";

import type { AdjacentWork } from "@/lib/queries/work";

export interface WorkNavProps {
  prev?: AdjacentWork;
  next?: AdjacentWork;
}

export function WorkNav({ prev, next }: WorkNavProps) {
  if (!prev && !next) {
    return null;
  }
  return (
    <Box
      as="nav"
      aria-label="Work navigation"
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        gap: "4",
        mt: "12",
        px: { base: "4", md: "8" },
        pb: "12",
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      <Box css={{ flex: 1, minW: 0 }}>
        {prev && (
          <Link
            href={`/work/${prev.slug}`}
            css={{
              display: "block",
              color: "primary.500",
              textDecoration: "none",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              _hover: { textDecoration: "underline" },
            }}
          >
            <Box as="span" css={{ opacity: 0.5 }}>
              ← prev{" "}
            </Box>
            {prev.title}
          </Link>
        )}
      </Box>
      <Box css={{ flex: 1, minW: 0, textAlign: "right" }}>
        {next && (
          <Link
            href={`/work/${next.slug}`}
            css={{
              display: "block",
              color: "primary.500",
              textDecoration: "none",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              _hover: { textDecoration: "underline" },
            }}
          >
            {next.title}
            <Box as="span" css={{ opacity: 0.5 }}>
              {" "}
              next →
            </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
}
