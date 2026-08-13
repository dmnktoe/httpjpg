import { Box, Link } from "@httpjpg/ui";

import type { RelatedWorkItem } from "@/lib/queries/related-work";

export function RelatedWorkRow({ title, href, date, sharedTags }: RelatedWorkItem) {
  const year = date ? new Date(date).getFullYear() : null;

  return (
    <Box as="li" css={{ borderColor: "pageBorder", borderTop: "1px solid" }}>
      <Link
        href={href}
        css={{
          display: "flex",
          alignItems: "baseline",
          gap: "4",
          py: "2",
          color: "inherit",
          textDecoration: "none",
          _hover: { "& [data-related-title]": { textDecoration: "underline" } },
        }}
      >
        {/* Rendered even when the story carries no date, so the titles stay in one column. */}
        <Box as="span" css={{ flexShrink: 0, w: "10", opacity: 0.5, fontSize: "xs" }}>
          {year}
        </Box>
        <Box
          as="span"
          data-related-title
          css={{
            flex: "1",
            minW: 0,
            color: "primary.500",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {title}
        </Box>
        {sharedTags.length > 0 && (
          <Box
            as="span"
            css={{
              display: { base: "none", md: "block" },
              flexShrink: 0,
              opacity: 0.5,
              fontSize: "xs",
            }}
          >
            {sharedTags.join(" · ")}
          </Box>
        )}
      </Link>
    </Box>
  );
}
