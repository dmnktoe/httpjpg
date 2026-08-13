import { Box, Image, Link } from "@httpjpg/ui";

import { RELATED_CARD_ASPECT_RATIO, type RelatedWorkItem } from "@/lib/queries/related-work";

export function RelatedWorkCard({
  title,
  href,
  date,
  thumb,
  thumbSrcSet,
  sharedTags,
}: RelatedWorkItem) {
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
          <Image
            src={thumb}
            srcSet={thumbSrcSet}
            alt=""
            aspectRatio={RELATED_CARD_ASPECT_RATIO}
            sizes="(min-width: 768px) 33vw, 100vw"
            loading="lazy"
          />
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
