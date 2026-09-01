import { parseWorkAccent } from "../../lib/work-accent";
import { Box } from "../box/box";
import { Icon } from "../icon/icon";
import type { WorkCardVariant } from "./work-card";
import { WorkCardTags } from "./work-card-tags";

export function WorkCardTitle({
  title,
  variant,
  tags,
  accentColor,
}: {
  title: string;
  variant: WorkCardVariant;
  tags?: string[];
  accentColor?: string;
}) {
  const accent = parseWorkAccent(accentColor);
  return (
    <Box
      css={{
        width: { base: "full", xl: "1/2" },
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
          textAlign: { base: "left", md: "justify" },
          textWrap: "balance",
          mt: "-0.78em",
          ...(variant === "compact"
            ? { fontSize: "clamp(1.75rem, 8cqi, 5rem)" }
            : variant === "featured"
              ? { fontSize: "clamp(2.5rem, 22cqi, 14rem)" }
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
          style={accent ? { color: accent.hex } : undefined}
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
