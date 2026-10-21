import { Box } from "../box/box";
import { Icon } from "../icon/icon";
import type { WorkCardVariant } from "./work-card";
import { WorkCardTags } from "./work-card-tags";

export function WorkCardTitle({
  title,
  variant,
  tags,
}: {
  title: string;
  variant: WorkCardVariant;
  tags?: string[];
}) {
  const isFeatured = variant === "featured";
  const isLongTitle = title.length > LONG_TITLE_LENGTH;
  return (
    <Box
      css={{
        width: isFeatured ? "full" : { base: "full", xl: "1/2" },
        containerType: "inline-size",
      }}
    >
      <Box
        as="h3"
        css={{
          position: "relative",
          zIndex: "slideshow",
          lineHeight: 0.9,
          fontFamily: "headline",
          letterSpacing: "tighter",
          textAlign: isFeatured ? "left" : { base: "left", md: "justify" },
          textWrap: "balance",
          mt: "-0.78em",
          ...(variant === "compact"
            ? { fontSize: "clamp(1.75rem, 8cqi, 5rem)" }
            : isFeatured
              ? isLongTitle
                ? { fontSize: "clamp(2rem, 7cqi, 7rem)" }
                : { fontSize: "clamp(2.5rem, 13cqi, 13rem)" }
              : {
                  fontSize: {
                    base: "clamp(1.5rem, 7cqi, 3rem)",
                    md: "clamp(1.75rem, 14cqi, 4rem)",
                  },
                }),
        }}
      >
        <Icon
          name="arrow-up"
          size="1.25em"
          css={{
            display: "inline-block",
            my: "-0.625em",
            mr: "2",
            verticalAlign: "middle",
            transform: "rotate(90deg)",
          }}
        />
        {title}
      </Box>
      {tags && tags.length > 0 && <WorkCardTags tags={tags} />}
    </Box>
  );
}

/** Featured titles longer than this drop to a smaller size so they don't fill the screen. */
const LONG_TITLE_LENGTH = 32;
