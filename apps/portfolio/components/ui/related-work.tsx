import { Box, Image, Link, Tag } from "@httpjpg/ui";

import type { RelatedWork as RelatedWorkData } from "@/lib/queries/related-work";

export interface RelatedWorkProps extends RelatedWorkData {}

export function RelatedWork({ tags, related }: RelatedWorkProps) {
  if (tags.length === 0 && related.length === 0) {
    return null;
  }

  return (
    <Box
      as="section"
      aria-label="Tags and related work"
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "6",
        mt: "12",
        px: { base: "4", md: "8" },
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      {tags.length > 0 && <TagRow tags={tags} />}
      {related.length > 0 && (
        <Box>
          <Label>related</Label>
          <Box
            as="ul"
            css={{
              display: "grid",
              gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
              gap: "6",
              mt: "3",
              listStyle: "none",
            }}
          >
            {related.map((item) => (
              <RelatedItem key={item.id} {...item} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <Box>
      <Label>tagged</Label>
      <Box css={{ display: "flex", flexWrap: "wrap", gap: "2", mt: "3" }}>
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Box>
    </Box>
  );
}

function RelatedItem({ title, href, date, thumb, sharedTags }: RelatedWorkData["related"][number]) {
  const year = date ? new Date(date).getFullYear() : null;

  return (
    <Box as="li" css={{ minW: 0 }}>
      <Link
        href={href}
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "2",
          color: "inherit",
          textDecoration: "none",
          _hover: { "& [data-related-title]": { textDecoration: "underline" } },
        }}
      >
        {thumb && (
          <Image src={thumb} alt="" aspectRatio="4/3" sizes="(min-width: 768px) 33vw, 100vw" />
        )}
        <Box
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "2",
          }}
        >
          <Box
            as="span"
            data-related-title
            css={{
              color: "primary.500",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {title}
          </Box>
          {year && (
            <Box as="span" css={{ flexShrink: 0, opacity: 0.5, fontSize: "xs" }}>
              {year}
            </Box>
          )}
        </Box>
        {sharedTags.length > 0 && (
          <Box as="span" css={{ opacity: 0.5, fontSize: "xs" }}>
            {sharedTags.join(" · ")}
          </Box>
        )}
      </Link>
    </Box>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Box
      as="h2"
      css={{
        opacity: 0.5,
        fontFamily: "mono",
        fontSize: "xs",
        fontWeight: "normal",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Box>
  );
}
